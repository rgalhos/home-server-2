import * as fs from "fs";
import * as path from "path";
import * as crypto from "crypto";
import { tmpdir } from "os";
import Ffmpeg from "fluent-ffmpeg";
import logger from "../logger";
import { addToSkipThumbList } from "../fs/noThumb";

const NO_THUMBNAILS = 5;

export default function generateVideoThumb(absoluteFilePath: string, hash: string) : Promise<void> {
    return new Promise((resolve, reject) => {
        Ffmpeg.ffprobe(absoluteFilePath, (err, data) => {
            if (err) {
                return reject(err);
            }

            const output = hash;
            const duration = data.format.duration!;

            (async () => {
                let fileList: string[] = [];
                let time = Math.trunc(duration / 6);
                let previewTime = Math.min(4, time);

                logger.debug(`Generating video thumbnail for "${absoluteFilePath}"`);
                logger.debug("Info:", JSON.stringify({ time, previewTime }));

                // Create poster
                await _generatePoster(absoluteFilePath, hash, time);

                for (let i = 1; i < NO_THUMBNAILS; i++) {
                    logger.debug(`Generating part ${i} of ${NO_THUMBNAILS}`);

                    await _genThumb(absoluteFilePath, time * i, previewTime).then((tempFile) => {
                        fileList.push(tempFile);
                    })
                    .catch(reject);
                }

                setTimeout(async () => {
                    const dest = path.join(process.env.THUMBNAIL_LOCATION as string, output + ".mp4");

                    logger.debug(`Generating final thumbnail for ${absoluteFilePath}\t-> ${output}`);

                    const conv = Ffmpeg();

                    // TO DO: tirar isso
                    /*
                    if (process.env.FFMPEG_PATH)
                        conv.setFfmpegPath("D:/ffmpeg/bin/ffmpeg.exe");
                    */

                    await conv
                        .on("error", (e) => {
                            logger.error(e);

                            // FFMPEG is using too much memory, disk or CPU
                            if (e?.code === "EBUSY") {
                                // Generate later
                                setTimeout(resolve, 10000);
                            } else {
                                addToSkipThumbList(hash);
                                resolve();
                            }
                        })
                        .on("end", resolve)
                        .input(fileList[0])
                        .input(fileList[1])
                        .input(fileList[2])
                        .input(fileList[3])
                        .videoCodec("libx264")
                        .addOption([ "-crf 27", "-preset veryfast" ])
                        .noAudio()
                        .complexFilter("[0:v] [1:v] [2:v] [3:v] concat=n=4:v=1 [vv]")
                        .map("[vv]")
                        .save(dest)
                    ;
                    
                    logger.debug(`Created video thumbnail ${dest}`);

                    setTimeout(() => {
                        fileList.forEach((tempFile) => {
                            logger.debug(`Deleting temporary file "${tempFile}"`);

                            try {
                                fs.unlinkSync(tempFile);
                            } catch (e) {
                                // Could not delete temporary thumbail. It sucks but it's not fatal
                                logger.error(`Could not delete temporary file "${tempFile}"`);
                                logger.error(e);
                            }
                        });
                    }, 10000);
                }, 2000);
            })();
        });
    });
}


function _genThumb(absoluteFilePath: string, startTime: number, previewTime: number) : Promise<string> {
    return new Promise(async (resolve, reject) => {
        const tempFileName = path.join(tmpdir(), "./" + crypto.randomBytes(8).toString('hex') + ".mp4");

        Ffmpeg(absoluteFilePath)
            //.on("stderr", logger.error)
            .noAudio()
            .setStartTime(startTime)
            .setDuration(previewTime)
            .videoCodec("libx264")
            .addOption([ "-crf 27", "-preset veryfast" ])
            .outputFPS(12)
            .size("480x?")
            .setAspectRatio("16:9")
            .autoPad()
            //.outputOption("-movflags faststart")
            .save(tempFileName)
            .on("error", (e) => {
                logger.error(e);
                reject(e);
            })
            .on("end", () => {
                resolve(tempFileName);
            })
        ;
    });
}

function _generatePoster(absoluteFilePath: string, hash: string, timestamp: number) : Promise<void> {
    return new Promise((resolve, reject) => {
        logger.debug("Generating poster for " + hash);

        Ffmpeg(absoluteFilePath)
            .takeScreenshots({
                count: 1,
                timestamps: [ timestamp ],
                size: "480x270",
                folder: process.env.THUMBNAIL_LOCATION as string,
                filename: hash + "_poster.jpg",
            })
            .on("end", () => {
                logger.debug("Successfully generated poster for " + hash);
                resolve();
            })
            .on("error", (err) => {
                logger.error("Could not generate video poster:");
                logger.error(err);

                resolve();
            })
        ;
    });
}

import * as fs from "fs";
import * as path from "path";
import * as crypto from "crypto";
import { tmpdir } from "os";
import Ffmpeg from "fluent-ffmpeg";
import getVideoDurationInSeconds from "get-video-duration";
import logger from "../logger";

const NO_THUMBNAILS = 5;

export default function generateVideoThumb(absoluteFilePath: string, output: string) : Promise<void> {
    return new Promise((resolve, reject) => {
        getVideoDurationInSeconds(absoluteFilePath).then((duration) => {
            (async () => {
                let fileList: string[] = [];
                let time = Math.trunc(duration / 6);
                let previewTime = Math.min(4, time);

                logger.debug(`Generating video thumbnail for "${absoluteFilePath}"`);
                logger.debug("Info:", JSON.stringify({ time, previewTime }));

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
                    if (process.env.FFMPEG_PATH)
                        conv.setFfmpegPath(process.env.FFMPEG_PATH as string);

                    // ffmpeg  -i 1.mp4 -i 2.mp4 -i 3.mp4 -i 4.mp4 -i 5.mp4 -filter_complex "[0:v] [1:v] [2:v] [3:v] [4:v] concat=n=5:v=1 [vv]" -map "[vv]" out.mp4
                    await conv
                        //.on("stderr", logger.error)
                        .on("error", (e) => { logger.error(e); reject(e) })
                        .input(fileList[0])
                        .input(fileList[1])
                        .input(fileList[2])
                        .input(fileList[3])
                        .videoCodec("libx264")
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

                    resolve();
                }, 2000);
            })();
        }).catch(reject);
    });
}


// ffmpeg -ss 900 -i lls3.mp4 -vf "select=eq(pict_type\,I), scale=360:-1" -vframes 1 t5.jpg
function _genThumb(absoluteFilePath: string, startTime: number, previewTime: number) : Promise<string> {
    return new Promise(async (resolve, reject) => {
        const tempFileName = path.join(tmpdir(), "./" + crypto.randomBytes(8).toString('hex') + ".mp4");

        const conv = Ffmpeg();
        
        // TO DO: tirar isso
        if (process.env.FFMPEG_PATH)
            conv.setFfmpegPath(process.env.FFMPEG_PATH as string);

        await conv
            .input(absoluteFilePath)
            //.on("stderr", logger.error)
            .on("error", (e) => { logger.error(e); reject(e) })
            .noAudio()
            .setStartTime(startTime)
            .setDuration(previewTime)
            .videoCodec("libx264")
            .outputFPS(12)
            .size("480x?")
            .setAspectRatio("16:9")
            .autoPad()
            .outputOption("-movflags faststart")
            .save(tempFileName)
        ;
        
        resolve(tempFileName);
    });
}

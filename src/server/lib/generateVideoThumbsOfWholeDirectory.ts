import * as fs from "fs";
import * as path from "path";
import { Worker, isMainThread, parentPort, workerData } from "worker_threads";
import normalizePath from "../fs/normalizePath";
import generateVideoThumb from "./generateVideoThumb";
import logger from "../logger";
import getVideosOfDirectory from "../fs/getVideosOfDirectory";

export default function generateVideoThumbsOfWholeDirectory(relativePath: string) : Promise<any> {
    return new Promise((resolve, reject) => {
        getVideosOfDirectory(relativePath).then((videos) => {
            let promises: Array<Promise<any>> = [];

            videos.forEach((video) => {
                promises.push(
                    new Promise((resolve) => {
                        fs.access(path.join(process.env.THUMBNAIL_LOCATION as string, video.hash + ".mp4"), (err) => {
                            resolve(err ? {
                                path: video.path,
                                hash: video.hash,
                            } : null);
                        })
                    })
                );
            });

            Promise.all(promises).then(videosWithNoThumb => {
                videosWithNoThumb = videosWithNoThumb.filter(x => x !== null);

                if (videosWithNoThumb.length === 0) {
                    resolve(void 0);

                    return;
                }

                const videoThumbWorker = new Worker(__filename, {
                    workerData: videosWithNoThumb,
                });

                videoThumbWorker.on("message", (message: any) => {
                    if (!message.hasOwnProperty("success")) {
                        logger.error("Received malformed message from videoThumbWorker!");
                        return void reject(new Error("Received malformed message from videoThumbWorker!"));
                    }

                    if (message.success) {
                        resolve(message.value);
                    } else {
                        reject(message.value);
                    }
                });

                videoThumbWorker.on("exit", (exitCode) => {
                    logger.info("Video thumbnail worker has exited. Exit code:", exitCode);
                });
            }).catch(reject);
        }).catch(reject);
    });
}

if (!isMainThread) {
    logger.info("Video thumbnail worker has been initialized");

    (async function() {
        function sendSuccess(value: any) {
            parentPort?.postMessage({ success: true, value });
        }

        function sendError(value: any) {
            logger.error("videoThumbWorker: " + value);
            parentPort?.postMessage({ success: false, value });
        }

        if (!Array.isArray(workerData)) {
            return void sendError("videoThumbWorker was called with no workerData, this should not happen!");
        }

        // workerData = videosWithNoThumb
        logger.debug("Generating thumbs for", workerData.length, "videos");

        let promises: Array<Promise<any>> = [];

        for (const video of workerData) {
            await generateVideoThumb(normalizePath(video.path), video.hash).catch(sendError);
        }

        Promise.all(promises)
            .then(sendSuccess)
            .catch(sendError)
        ;
    })();
}

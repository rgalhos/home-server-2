import * as fs from "fs";
import * as path from "path";
import { Worker, isMainThread, parentPort, workerData } from "worker_threads";
import { toAbsolutePath } from "../utils";
import generateThumb from "./generateThumb";
//import getImagesOfDirectory from "../fs/_getImagesOfDirectory";
import logger from "../logger";
import getFilesOfDirectory from "../fs/getFilesOfDirectory";
import { getSkipThumbList } from "../fs/noThumb";

export default function generateThumbsOfWholeDirectory(relativePath: string) : Promise<any> {
    return new Promise((resolve, reject) => {
        getFilesOfDirectory(relativePath).then((files) => {
            const skipList = getSkipThumbList();
            const images = files.filter(({ type, hash }) => type === "image" && skipList.indexOf(hash) === -1);
            let promises: Array<Promise<any>> = [];

            images.forEach((image) => {
                promises.push(
                    new Promise((resolve) => {
                        fs.access(path.join(process.env.THUMBNAIL_LOCATION as string, image.hash + ".jpg"), (err) => {
                            resolve(err ? {
                                path: image.path,
                                hash: image.hash,
                            } : null);
                        })
                    })
                );
            });

            Promise.all(promises).then(imagesWithNoThumb => {
                imagesWithNoThumb = imagesWithNoThumb.filter(x => x !== null);

                if (imagesWithNoThumb.length === 0) {
                    resolve(void 0);

                    return;
                }

                const thumbWorker = new Worker(__filename, {
                    workerData: imagesWithNoThumb,
                });

                thumbWorker.on("message", (message: any) => {
                    if (!message.hasOwnProperty("success")) {
                        logger.error("Received malformed message from thumbWorker!");
                        return void reject(new Error("Received malformed message from thumbWorker!"));
                    }

                    if (message.success) {
                        resolve(message.value);
                    } else {
                        reject(message.value);
                    }
                });

                thumbWorker.on("exit", (exitCode) => {
                    logger.info("Thumbnail worker has exited. Exit code:", exitCode);
                });
            }).catch(reject);
        }).catch(reject);
    });
}

if (!isMainThread) {
    logger.info("Thumbnail worker has been initialized");

    (function() {
        function sendSuccess(value: any) {
            parentPort?.postMessage({ success: true, value });
        }

        function sendError(value: any) {
            logger.error("thumbWorker: " + value);
            parentPort?.postMessage({ success: false, value });
        }

        if (!Array.isArray(workerData)) {
            return void sendError("worker_generateThumbsOfWholeDirectory was called with no workerData, this should not happen!");
        }

        // workerData = imagesWithNoThumb
        logger.debug("Generating thumbs for", workerData.length, "images");

        let promises: Array<Promise<any>> = [];

        workerData.forEach((image: { hash: string, path: string }) => {
            promises.push(
                generateThumb(toAbsolutePath(image.path), image.hash)
            );
        });

        Promise.all(promises)
            .then(sendSuccess)
            .catch(sendError)
        ;
    })();
}

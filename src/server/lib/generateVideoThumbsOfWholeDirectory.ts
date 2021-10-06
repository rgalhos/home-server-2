import * as fs from "fs";
import * as path from "path";
import { Worker, isMainThread, parentPort, workerData } from "worker_threads";
import generateVideoThumb from "./generateVideoThumb";
import logger from "../logger";
import { toAbsolutePath } from "../utils";
import getFilesOfDirectory from "../fs/getFilesOfDirectory";
import { getSkipThumbList } from "../fs/noThumb";
import IFileInfo from "../../common/interfaces/IFileInfo";

export default function generateVideoThumbsOfWholeDirectory(relativePath: string) : Promise<any> {
    return new Promise((resolve, reject) => {
        getFilesOfDirectory(relativePath).then((files) => {
            const skipList = getSkipThumbList();
            const videos = files.filter(({ type, hash }) => type === "video" && skipList.indexOf(hash) === -1);

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

            Promise.all(promises).then((videosWithNoThumb: IFileInfo[]) => {
                videosWithNoThumb = videosWithNoThumb.filter(x => x !== null);

                if (videosWithNoThumb.length === 0) {
                    resolve(void 0);

                    return;
                }

                let instances = Number(process.env.CONCURRENT_FFMPEG_INSTANCES) || 1;
                let videoList = divideVideoList(videosWithNoThumb);

                while (instances--) {
                    if (!videoList[instances])
                        continue;
                        
                    logger.debug("Starting video thumbnail worker #" + instances);

                    const videoThumbWorker = new Worker(__filename, {
                        workerData: videoList[instances],
                    });

                    videoThumbWorker.on("message", (message: any) => {
                        if (!message.hasOwnProperty("success")) {
                            logger.error("Received malformed message from videoThumbWorker!");
                            return void reject(new Error("Received malformed message from videoThumbWorker!"));
                        }

                        (message.success ? resolve : reject)(message.value);
                    });

                    videoThumbWorker.on("exit", (exitCode) => {
                        logger.info("Video thumbnail worker has exited. Exit code:", exitCode);
                    });
                }
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
            await generateVideoThumb(toAbsolutePath(video.path), video.hash).catch(sendError);
        }

        Promise.all(promises)
            .then(sendSuccess)
            .catch(sendError)
        ;
    })();
}

function divideVideoList(arr: IFileInfo[]) : IFileInfo[][] {
    let max = arr.length / (Number(process.env.CONCURRENT_FFMPEG_INSTANCES) || 1);

    return arr.reduce((resultArr, item, i) => {
        const chunkIndex = Math.floor(i / max);

        // @ts-ignore
        resultArr[chunkIndex] = (resultArr[chunkIndex] || []).concat(item);

        return resultArr;
    }, []);
}

import * as fs from "fs";
import * as path from "path";

import * as mime from "mime-types";
import getFileStats from "./getFileStats";
import IFileInfo from "../../common/interfaces/IFileInfo";
import hashFunc from "../lib/hashFunc";
import { supportedMimeTypes } from "../lib/generateThumb";
import { toAbsolutePath } from "../utils";

const supportedVideoMimeTypes = [
    "video/3gpp",
    "video/mp4",
    "video/mpeg",
    "video/quicktime",
    "video/x-ms-wmv",
    "video/x-msvideo",
    "video/x-matroska"
];

export default function getFilesOfDirectory(relativePath: string) : Promise<IFileInfo[]> {
    const absolutePath = toAbsolutePath(relativePath);

    return new Promise((resolve, reject) => {
        fs.readdir(absolutePath, { withFileTypes: true }, (err, files) => {
            if (err) {
                return reject({
                    error: true,
                    code: err.code,
                    message: err.message.replace(absolutePath, relativePath),
                });
            }

            files = files.filter(dirent => !dirent.isDirectory() && !dirent.isSymbolicLink());

            let promises: Array<Promise<unknown>> = [];
            let fileList: IFileInfo[] = [];

            files.forEach(file => {
                let _path = path.join(relativePath, file.name);

                promises.push(
                    getFileStats(path.join(absolutePath, file.name))
                    .then((stats) => {
                        const _hash = hashFunc(_path, stats.ctime);

                        let thumb: string | null = null;
                        let type: IFileInfo["type"] = "file";

                        if (supportedMimeTypes.indexOf(mime.lookup(file.name) as string) !== -1) {
                            type = "image"
                        } else if (supportedVideoMimeTypes.indexOf(mime.lookup(file.name) as string) !== -1) {
                            type = "video";
                        }

                        if (type !== "file") {
                            let jpgThumb = path.join(process.env.THUMBNAIL_LOCATION as string, _hash + ".jpg");
                            let mp4Thumb = path.join(process.env.THUMBNAIL_LOCATION as string, _hash + ".mp4");

                            if (fs.existsSync(jpgThumb)) {
                                thumb = _hash + ".jpg";
                            } else if (fs.existsSync(mp4Thumb)) {
                                thumb = _hash + ".mp4";
                            }
                        }

                        fileList.push({
                            hash: _hash,
                            name: file.name,
                            path: _path,
                            size: stats.size,
                            // TO DO: rever a lógica das thumbnails e implementar uma lista para ignorar essas checagens
                            thumbnail: thumb,
                            accessTime: +stats.atime,
                            lastModified: +stats.mtime,
                            created: +stats.ctime,
                            mimeType: mime.lookup(file.name),
                            type: type,
                        } as IFileInfo);
                    })
                    .catch((error) => {
                        console.error(error);
                        reject(error);
                    })
                );
            });

            Promise.all(promises).then(() => {
                resolve(fileList);
            });
        });
    });
}

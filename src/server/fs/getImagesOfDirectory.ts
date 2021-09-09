import * as fs from "fs";
import * as path from "path";

import * as mime from "mime-types";
import getFileStats from "./getFileStats";
import IFileInfo from "../../common/interfaces/IFileInfo";
import hashFunc from "../lib/hashFunc";
import { supportedMimeTypes } from "../lib/generateThumb";
import { toAbsolutePath } from "../utils";

export default function getImagesOfDirectory(relativePath: string) : Promise<IFileInfo[]> {
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

            files = files.filter(dirent => !dirent.isDirectory() && !dirent.isSymbolicLink())
                .filter(({ name }) => supportedMimeTypes.indexOf(mime.lookup(name) as string) !== -1);

            let promises: Array<Promise<unknown>> = [];
            let fileList: IFileInfo[] = [];

            files.forEach(file => {
                let _path = path.join(relativePath, file.name);

                promises.push(
                    getFileStats(path.join(absolutePath, file.name))
                    .then((stats) => {
                        let _hash = hashFunc(_path, stats.ctime);

                        fileList.push({
                            hash: _hash,
                            name: file.name,
                            path: _path,
                            size: stats.size,
                            thumbnail: path.join(process.env.THUMBNAIL_LOCATION as string, _hash + ".jpg"),
                            accessTime: +stats.atime,
                            lastModified: +stats.mtime,
                            created: +stats.ctime,
                            mimeType: mime.lookup(file.name),
                        } as IFileInfo);
                    })
                    .catch((error) => {
                        console.error(error);
                    })
                );
            });

            Promise.all(promises).then(() => {
                resolve(fileList);
            });
        });
    });
}

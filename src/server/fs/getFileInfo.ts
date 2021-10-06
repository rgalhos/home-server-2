import * as path from "path";
import * as fs from "fs";
import * as mime from "mime-types";
import IFileInfo from "../../common/interfaces/IFileInfo";
import Database from "../database";
import getFileStats from "./getFileStats";
import { supportedMimeTypes } from "../lib/generateThumb";
import getThumbnail from "./getThumbnail";

const supportedVideoMimeTypes = [
    "video/3gpp",
    "video/mp4",
    "video/mpeg",
    "video/quicktime",
    "video/x-ms-wmv",
    "video/x-msvideo",
    "video/x-matroska"
];

export default function getFileInfo(db: Database, hash: string) : Promise<IFileInfo> {
    return new Promise((resolve, reject) => {
        let data = db.getFileByHash(hash);

        if (!!data.error) {
            return reject(data);
        }

        getFileStats(data.path).then((stats) => {
            const name = path.basename(data.path);
            const mimeType = mime.lookup(name);

            let thumb: string | null = null;
            let type: IFileInfo["type"] = "file";
    
            if (supportedMimeTypes.indexOf(mimeType as string) !== -1) {
                type = "image"
            } else if (supportedVideoMimeTypes.indexOf(mimeType as string) !== -1) {
                type = "video";
            }

            return resolve({
                hash: hash,
                path: data.path,
                name: name,
                size: stats.size,
                accessTime: +stats.atime,
                lastModified: +stats.mtime,
                created: +stats.birthtime,
                thumbnail: getThumbnail(name, hash),
                type: type,
                mimeType: mimeType,
            } as IFileInfo);
        })
        .catch(reject);
    });
}

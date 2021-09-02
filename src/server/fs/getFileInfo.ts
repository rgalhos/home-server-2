import * as path from "path";

import * as mime from "mime-types";
import IFileInfo from "../../common/interfaces/IFileInfo";
import Database from "../database";
import getFileStats from "./getFileStats";
import { supportedMimeTypes } from "../lib/generateThumb";

export default function getFileInfo(db: Database, hash: string) : Promise<IFileInfo> {
    return new Promise((resolve, reject) => {
        let data = db.getFileByHash(hash);

        if (!!data.error) {
            return reject(data);
        }

        let thumb: null | string = null;
        const mimeType = mime.lookup(data.path) as string;

        if (supportedMimeTypes.indexOf(mimeType) !== -1) {
            thumb = path.join(process.env.THUMBNAIL_LOCATION as string, hash + ".jpg").replace(/\\+|\/+/g, '/');
        }

        getFileStats(data.path).then((stats) => {
            return resolve({
                hash: hash,
                path: data.path,
                name: path.basename(data.path),
                size: stats.size,
                accessTime: +stats.atime,
                lastModified: +stats.mtime,
                created: +stats.birthtime,
                thumbnail: thumb,
                mimeType: mimeType,
            } as IFileInfo);
        })
        .catch(reject);
    });
}

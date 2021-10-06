import * as fs from "fs";
import * as path from "path";
import * as mime from "mime-types";
import IFileInfo from "../../common/interfaces/IFileInfo";
import { supportedMimeTypes } from "../lib/generateThumb";

const supportedVideoMimeTypes = [
    "video/3gpp",
    "video/mp4",
    "video/mpeg",
    "video/quicktime",
    "video/x-ms-wmv",
    "video/x-msvideo",
    "video/x-matroska"
];

export default function getThumbnail(fileName: string, hash: string) : string | null {
    let thumb: string | null = null;
    let type: IFileInfo["type"] = "file";

    if (supportedMimeTypes.indexOf(mime.lookup(fileName) as string) !== -1) {
        type = "image"
    } else if (supportedVideoMimeTypes.indexOf(mime.lookup(fileName) as string) !== -1) {
        type = "video";
    }

    if (type !== "file") {
        let jpgThumb = path.join(process.env.THUMBNAIL_LOCATION as string, hash + ".jpg");
        let mp4Thumb = path.join(process.env.THUMBNAIL_LOCATION as string, hash + ".mp4");

        if (fs.existsSync(jpgThumb)) {
            thumb = hash + ".jpg";
        } else if (fs.existsSync(mp4Thumb)) {
            thumb = hash + ".mp4";
        }
    }

    return thumb;
}
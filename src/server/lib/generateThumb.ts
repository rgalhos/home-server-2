import * as path from "path";
import sharp from "sharp";
import * as mime from "mime-types";
import { addToSkipThumbList } from "../fs/noThumb";
import logger from "../logger";

const supportedMimeTypes = [
    "image/jpeg",
    "image/png",
    "image/webp",
    "image/avif",
    "image/tiff",
    "image/gif",
    "image/svg+xml"
];

export { supportedMimeTypes };

export default function generateThumb(input: string, hash: string) : Promise<sharp.OutputInfo | void> {
    return new Promise((resolve, reject) => {
        if (supportedMimeTypes.indexOf(mime.lookup(input) as string) === -1) {
            return reject(new Error("mime type not supported"));
        }

        sharp(input)
            .resize(192, 192)
            .jpeg()
            .toFile(path.join(process.env.THUMBNAIL_LOCATION as string, hash + ".jpg"))
        .then(resolve)
        .catch((error) => {
            logger.error(error + " [" + hash + "]");

            addToSkipThumbList(hash);

            resolve();
        });
    });
}

import * as path from "path";
import sharp from "sharp";
import * as mime from "mime-types";

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

export default function generateThumb(input: string, output: string) : Promise<sharp.OutputInfo> {
    return new Promise((resolve, reject) => {
        if (supportedMimeTypes.indexOf(mime.lookup(input) as string) === -1) {
            return reject(new Error("mime type not supported"));
        }

        sharp(input)
            .resize(192, 192)
            .jpeg()
            .toFile(path.join(process.env.THUMBNAIL_LOCATION as string, output + ".jpg"))
        .then(resolve)
        .catch(reject);
    });
}

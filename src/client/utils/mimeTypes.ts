import * as mime from "mime-types";

export function isVideo(x: string) {
    return videoMimeTypes.indexOf(mime.lookup(x) as string) !== -1;
}

export function isImage(x: string) {
    return imageMimeTypes.indexOf(mime.lookup(x) as string) !== -1;
}

const imageMimeTypes = [
    "image/jpeg",
    "image/png",
    "image/webp",
    "image/avif",
    "image/tiff",
    "image/gif",
    "image/svg+xml",
    "image/bmp"
];

const videoMimeTypes = [
    "video/mp4",
    //"video/x-matroska",
    //"video/webm",
    //"video/quicktime",
    //"video/x-msvideo"
];

export { imageMimeTypes, videoMimeTypes };

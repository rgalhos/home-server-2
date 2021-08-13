import * as fs from "fs";
import * as path from "path";
import * as mime from "mime-types";
import normalizePath from "../fs/normalizePath";
import generateThumb, { supportedMimeTypes } from "./generateThumb";
import getImagesOfDirectory from "../fs/getImagesOfDirectory";

export default function generateThumbsOfWholeDirectory(relativePath: string) : Promise<any> {
    const absolutePath = normalizePath(relativePath);

    return new Promise((resolve, reject) => {
        getImagesOfDirectory(relativePath).then((images) => {
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
                    return resolve(void 0);
                }

                console.log("Generating thumbs for", imagesWithNoThumb.length, "images");

                promises = [];

                imagesWithNoThumb.forEach((image: { hash: string, path: string }) => {
                    promises.push(
                        generateThumb(normalizePath(image.path), image.hash)
                    );
                });

                Promise.all(promises)
                    .then(resolve)
                    .catch(reject)
                ;
            });
        }).catch(reject);
    });
}

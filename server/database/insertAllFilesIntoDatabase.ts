import getFilesOfDirectory from "../fs/getFilesOfDirectory";
import getImagesOfDirectory from "../fs/getImagesOfDirectory";
import Database from "./";

export default function insertAllFilesIntoDatabase(db: Database, relativePath: string) : Promise<void> {
    return new Promise((resolve, reject) => {
        getFilesOfDirectory(relativePath).then((files) => {
            getImagesOfDirectory(relativePath).then((images) => {
                db.insertFilesInBulk([ ...files, ...images ]);
                resolve();
            });
        })
        .catch(reject);
    });
}

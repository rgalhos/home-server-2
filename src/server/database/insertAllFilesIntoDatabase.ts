import getFilesOfDirectory from "../fs/getFilesOfDirectory";
import logger from "../logger";
import Database from ".";

export default function insertAllFilesIntoDatabase(db: Database, relativePath: string) : Promise<void> {
    return new Promise((resolve, reject) => {
        getFilesOfDirectory(relativePath).then((files) => {
            db.insertFilesInBulk(files);
            resolve();
        }).catch((e) => {
            logger.error(e);
            reject(e);
        });
    });
}

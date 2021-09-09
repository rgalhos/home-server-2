import * as fs from "fs";
import { toAbsolutePath } from "../utils";

export default function getFileStats(relativePath: string) : Promise<fs.Stats> {
    const absolutePath = toAbsolutePath(relativePath);

    return new Promise((resolve, reject) => {
        fs.stat(absolutePath, (err, stats) => {
            if (err) {
                return reject({
                    error: true,
                    code: err.code,
                    message: err.message.replace(absolutePath, relativePath),
                });
            }

            resolve(stats);
        });
    });
}

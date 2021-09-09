import * as fs from "fs";
import * as path from "path";
import IFolderOverview from "../../common/interfaces/IFolderOverview";
import { toAbsolutePath } from "../utils";

export default function getFolderOverview(relativePath: string) : Promise<IFolderOverview> {
    const absolutePath = toAbsolutePath(relativePath);

    return new Promise((resolve, reject) => {
        fs.readdir(absolutePath, { withFileTypes: true }, (err, files) => {
            if (err) {
                return reject({
                    error: true,
                    code: err.code,
                    message: err.message.replace(absolutePath, relativePath),
                });
            }

            resolve({
                name: path.basename(absolutePath),
                path: relativePath,
                isSymbolicLink: false,
                noFiles: files.length,
                size: 4096,
            } as IFolderOverview);
        });
    });
};

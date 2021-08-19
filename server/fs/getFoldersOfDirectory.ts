import * as fs from "fs";
import * as path from "path";

import normalizePath from "./normalizePath";
import getFolderOverview from "./getFolderOverview";
import IFolderOverview from "../../interfaces/IFolderOverview";

export default function getFoldersOfDirectory(relativePath: string) : Promise<IFolderOverview[]> {
    const absolutePath = normalizePath(relativePath);

    return new Promise((resolve, reject) => {
        fs.readdir(absolutePath, { withFileTypes: true }, (err, files) => {
            if (err) {
                return reject({
                    error: true,
                    code: err.code,
                    message: err.message.replace(absolutePath, relativePath),
                });
            }

            let folders = files.filter(dirent => dirent.isDirectory() || dirent.isSymbolicLink());
            
            let promises: Array<Promise<unknown>> = [];
            let folderList: IFolderOverview[] = [];

            folders.forEach(dir => {
                promises.push(
                    getFolderOverview(path.join(relativePath, dir.name))
                    .then((folder) => {
                        // Não mostra a pasta na listagem de diretórios
                        if (dir.name.startsWith(process.env.PRIVATE_PATH_PREFIX as string)) {
                            return;
                        }

                        if (dir.isSymbolicLink()) {
                            folder.isSymbolicLink = true;
                        }

                        folder.path = folder.path.replace(/\\+|\/+/g, '/');

                        folderList.push(folder);
                    })
                    .catch((error) => {
                        console.error(error);
                    })
                );
            });

            Promise.all(promises).then(() => {
                resolve(folderList);
            });
        });
    });
}

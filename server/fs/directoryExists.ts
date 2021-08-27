import * as fs from "fs";
import normalizePath from "./normalizePath";

export default function directoryExists(relativePath: string) : Promise<boolean> {
    const absolutePath = normalizePath(relativePath);

    return new Promise((resolve) => {
        resolve(fs.existsSync(absolutePath));
    });
}

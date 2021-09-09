import * as fs from "fs";
import { toAbsolutePath } from "../utils";

export default function directoryExists(relativePath: string) : Promise<boolean> {
    const absolutePath = toAbsolutePath(relativePath);

    return new Promise((resolve) => {
        resolve(fs.existsSync(absolutePath));
    });
}

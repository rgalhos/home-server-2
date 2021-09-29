import * as fs from "fs";
import * as path from "path";
import logger from "../logger";

export const SKIP_LIST_DIR = path.join(process.env.THUMBNAIL_LOCATION as string, "nothumb.json");

export function getSkipThumbList() : string[] {
    try {
        return JSON.parse(fs.readFileSync(SKIP_LIST_DIR).toString("utf8"));
    } catch (e: any) {
        if (e?.code !== "ENOENT") {
            logger.error(e);
        }
        return [];
    }
}

export function addToSkipThumbList(hash: string) {
    let skipList = getSkipThumbList();
    if (skipList.indexOf(hash) === -1) {
        skipList.push(hash);
        try {
            fs.writeFileSync(SKIP_LIST_DIR, JSON.stringify(skipList), { encoding: "utf8" });
        } catch (e) {
            logger.error(e);
        }
    }
}

export function shouldSkipThumb(hash: string) {
    return getSkipThumbList().indexOf(hash) !== -1;
}

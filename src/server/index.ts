require("dotenv").config();

import * as fs from "fs";
import * as path from "path";
import express from "express";
import formidable from "formidable";
import getFoldersOfDirectory from "./fs/getFoldersOfDirectory";
import getFilesOfDirectory from "./fs/getFilesOfDirectory";
import getFileInfo from "./fs/getFileInfo";
import Database from "./database";
import generateThumbsOfWholeDirectory from "./lib/generateThumbsOfWholeDirectory";
import insertAllFilesIntoDatabase from "./database/insertAllFilesIntoDatabase";
import directoryExists from "./fs/directoryExists";
import logger from "./logger";
import { normalizePathParam, toAbsolutePath } from "./utils";
import { applyFilters } from "../common/filteringAndSorting";
import ISearchFilter from "../common/interfaces/ISearchFilters";

let ALREADY_GENERATING_THUMBS = false;

//#region optional dependencies
let VIDEO_THUMBNAILS = false;
let generateVideoThumbsOfWholeDirectory = (noop: string) => new Promise<any>(r => r(void 0));

try {
    generateVideoThumbsOfWholeDirectory = require("./lib/generateVideoThumbsOfWholeDirectory").default;
    VIDEO_THUMBNAILS = process.env.VIDEO_THUMBNAILS === "true";
} catch (e) {
    logger.error(e);
    logger.warn("Optional dependencies were not installed: Video thumbnails won't be generated");
}
//#endregion optional dependencies

const THUMBNAIL_LOCATION = path.isAbsolute(process.env.THUMBNAIL_LOCATION as string)
    ? process.env.THUMBNAIL_LOCATION as string
    : path.join(__dirname, "../../", process.env.THUMBNAIL_LOCATION as string)
;

if (!fs.existsSync(THUMBNAIL_LOCATION)) {
    fs.mkdirSync(THUMBNAIL_LOCATION);
}

const db = new Database("./db.db3");
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(express.static(path.join(__dirname, "../../build")));
app.use("/~", express.static(process.env.FILESYSTEM_ROOT as string));
app.use("/~thumbs", express.static(THUMBNAIL_LOCATION));

//#region authentication
if (process.env.NODE_ENV === "production") {
    if (process.env.ENABLE_BASIC_AUTHENTICATION === "true") {
        app.use((req, res, next) => {
            const auth = { login: process.env.BASIC_AUTH_LOGIN, password: process.env.BASIC_AUTH_PASS };
            const b64auth = (req.headers.authorization || '').split(' ')[1] || '';
            const [login, password] = Buffer.from(b64auth, "base64").toString().split(':');

            if (login === auth.login && password === auth.password) {
                return next();
            }

            res.set("WWW-Authenticate", "Basic realm=\"401\"");
            res.status(401).send("Authentication required");
        });
    }

    app.get(/^\/\$(preview|upload|bin)/, (req, res) => {
        logger.http(JSON.stringify(req.headers, null, 4));

        res.sendFile(path.join(__dirname, "../../build/index.html"));
    });
}
//#endregion authentication

//#region api calls
// Middleware
app.use("/api/", (req, res, next) => {
    if (req.query.path)
        req.query.path = normalizePathParam(req.query.path as string);
    if (req.query.filesPath)
        req.query.filesPath = normalizePathParam(req.query.filesPath as string);

    next();
});

app.get("/api/getFolders", (req, res) => {
    const path = req.query.path as string;

    getFoldersOfDirectory(path)
    .then((folders) => {
        res.status(200).send(folders);
    })
    .catch((error) => {
        logger.error(error);
        
        res.status(500).send(error);
    });
});

app.get("/api/getFiles", (req, res) => {
    const path = req.query.path as string;
    let filters: ISearchFilter = {};

    try {
        filters = JSON.parse(req.query.filters as string);
    } catch (e) {
        // no op
    } finally {
        getFilesOfDirectory(path)
        .then((files) => {
            res.status(200).send(applyFilters(files, filters));
        })
        .catch((error) => {
            logger.error("/api/getFiles - " + error);

            // Probably invalid regexp in filter
            if (error instanceof SyntaxError) {
                return void res.status(400).send({
                    error: true,
                    message: error.message,
                });
            }
            
            res.status(500).send({
                error: true,
                message: error?.message || error
            });
        });
    }
});

app.get("/api/getFileInfo", (req, res) => {
    const hash = req.query.hash as string;

    getFileInfo(db, hash)
    .then((info) => {
        res.status(200).send(info);
    })
    .catch((error) => {
        logger.error(error);
        
        res.status(400).send(error);
    });
});

app.get("/api/generateThumbsForDirectory", (req, res) => {
    const path = req.query.path as string;

    // Prevents ffmpeg from r*ping all system resources
    if (ALREADY_GENERATING_THUMBS) {
        logger.info("Page access: Server is too busy generating thumbnails");
        return void res.status(200).send({
            error: false,
            message: "Server is too busy generating thumbnails. Slowdowns are expected and some thumbs may not be shown.",
        });
    }

    ALREADY_GENERATING_THUMBS = true;

    generateVideoThumbsOfWholeDirectory(path)
    .catch((error) => {
        logger.error(error);
    })
    .finally(() => {
        ALREADY_GENERATING_THUMBS = false;
    });

    generateThumbsOfWholeDirectory(path)
    .then(() => {
        res.status(200).end();
    })
    .catch((error) => {
        logger.error(error);

        res.status(500).send({ error: true, message: error?.message || error });
    });
});

app.get("/api/scanFiles", (req, res) => {
    const path = req.query.path as string;

    insertAllFilesIntoDatabase(db, path)
    .then(() => {
        res.status(200).end();
    })
    .catch((error) => {
        logger.error(error);

        res.status(500).send(error);
    });
});

app.get("/api/directoryExists", (req, res) => {
    const path = req.query.path as string;

    directoryExists(path).then((exists) => {
        res.status(200).send({ exists });
    });
});

app.post("/api/uploadFiles", (req, res) => {
    logger.info("Requested file upload");

    const filesPath = req.query.filesPath as string;

    const form = formidable({ multiples: true });

    form.parse(req, (err, _fields, files) => {
        if (err) {
            res.status(500).send({ error: true, message: err.message || "Unknown error" });
            return;
        }

        let promises: Array<Promise<unknown>> = [];

        // Handles a single file upload; Ugly as hell
        if (!!files['fileToUpload[]'] && !Array.isArray(files['fileToUpload[]'])) {
            files['fileToUpload[]'] = [ files['fileToUpload[]'] ];
        }

        // @ts-ignore
        logger.info(`Uploading ${files['fileToUpload[]'].length} files`);

        // @ts-ignore
        Array.from(files['fileToUpload[]']).forEach(file => {
            promises.push(
                new Promise<void>((resolve, reject) => {
                    const newPath = path.join(toAbsolutePath(filesPath), '/' + file.name);

                    logger.debug(`Renaming ${file.path} \t -> ${newPath}`);

                    fs.rename(file.path, newPath, (err) => {
                        if (err) {
                            logger.error(err);

                            return reject(err);
                        }

                        resolve();
                    });
                })
            );
        });

        Promise.all(promises)
        .then(() => {
            logger.info("All files have been uploaded successfully");

            res.status(200).send({ error: false });
        }).catch(e => {
            logger.error("Could not upload files: " + e?.message || "Unknown error");

            res.status(500).send({ error: true, message: e.message });
        });
    })
});
//#endregion api calls

// @ts-ignore
app.listen(process.env.SERVER_PORT, process.env.SERVER_HOST, function() {
    logger.info(`The server is listening to ${process.env.SERVER_HOST}:${process.env.SERVER_PORT}`);

    if (process.env.pm_id === undefined) {
        logger.warn("You are not running the server with PM2! If the server crashes it won't start again.");
    }
});

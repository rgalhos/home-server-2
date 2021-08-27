import * as fs from "fs";
import * as path from "path";
import express from "express";
import formidable from "formidable";
import getFoldersOfDirectory from "./fs/getFoldersOfDirectory";
import getFilesOfDirectory from "./fs/getFilesOfDirectory";
import getFileInfo from "./fs/getFileInfo";
import Database from "./database";
import generateThumbsOfWholeDirectory from "./lib/generateThumbsOfWholeDirectory";
import getImagesOfDirectory from "./fs/getImagesOfDirectory";
import insertAllFilesIntoDatabase from "./database/insertAllFilesIntoDatabase";
import directoryExists from "./fs/directoryExists";
import normalizePath from "./fs/normalizePath";
require("dotenv").config();

const db = new Database("./db.db3");
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/~thumbs", express.static(path.join(__dirname, "../../", process.env.THUMBNAIL_LOCATION as string)));
app.use("/~", express.static(process.env.FILESYSTEM_ROOT as string));

app.get("/api/getFolders", (req, res) => {
    let { path } = req.query;

    if (path === "/") path = "";
    path = (path as string).replace(/\\+|\/+/g, '/');

    getFoldersOfDirectory(path as string)
    .then((folders) => {
        res.status(200).send(folders);
    })
    .catch((error) => {
        res.status(500).send(error);
    });
});

app.get("/api/getFiles", (req, res) => {
    let { path } = req.query;

    if (path === "/") path = "";
    path = (path as string).replace(/\\+|\/+/g, '/');

    getFilesOfDirectory(path as string)
    .then((folders) => {
        res.status(200).send(folders);
    })
    .catch((error) => {
        res.status(500).send(error);
    });
});

app.get("/api/getFileInfo", (req, res) => {
    let { hash } = req.query;

    getFileInfo(db, hash as string)
    .then((info) => {
        res.status(200).send(info);
    })
    .catch((error) => {
        res.status(400).send(error);
    });
});

app.get("/api/getImages", (req, res) => {
    let { path } = req.query;

    if (path === "/") path = "";
    path = (path as string).replace(/\\+|\/+/g, '/');

    getImagesOfDirectory(path as string)
    .then((info) => {
        res.status(200).send(info);
    })
    .catch((error) => {
        res.status(400).send(error);
    });
});

app.get("/api/generateThumbsForDirectory", (req, res) => {
    let { path } = req.query;

    if (path === "/") path = "";

    generateThumbsOfWholeDirectory(path as string)
    .then(() => {
        res.status(200).end();
    })
    .catch((error) => {
        res.status(500).send(error);
    });
});

app.get("/api/scanFiles", (req, res) => {
    let { path } = req.query;

    if (path === "/") path = "";
    path = (path as string).replace(/\\+|\/+/g, '/');

    insertAllFilesIntoDatabase(db, path as string)
    .then(() => {
        res.status(200).end();
    })
    .catch((error) => {
        res.status(500).send(error);
    });
});

app.get("/api/directoryExists", (req, res) => {
    let { path } = req.query;

    if (path === "/") path = "";
    path = (path as string).replace(/\\+|\/+/g, '/');

    directoryExists(path).then((exists) => {
        res.status(200).send({ exists });
    });
});

app.post("/api/uploadFiles", (req, res) => {
    let { filesPath } = req.query;

    if (filesPath === "/") filesPath = "";
    filesPath = (filesPath as string).replace(/\\+|\/+/g, '/');

    const form = formidable({ multiples: true });

    form.parse(req, (err, _fields, files) => {
        if (err) {
            res.status(500).send({ error: true, message: err.message || "Unknown error" });
            return;
        }

        let ok = true;
        let promises: Array<Promise<unknown>> = [];

        // Handles a single file upload; Ugly as hell
        if (!!files['fileToUpload[]'] && !Array.isArray(files['fileToUpload[]'])) {
            files['fileToUpload[]'] = [ files['fileToUpload[]'] ];
        }

        // @ts-ignore
        Array.from(files['fileToUpload[]']).forEach(file => {
            promises.push(
                new Promise<void>((resolve, reject) => {
                    fs.rename(file.path, path.join(normalizePath(filesPath as string), '/' + file.name), (err) => {
                        if (err) {
                            return reject(err);
                        }
                        
                        resolve();
                    });
                })
            );
        });

        Promise.all(promises)
        .then(() => {
            res.status(200).send({ error: false });
        }).catch(e => {
            res.status(500).send({ error: true, message: e.message });
        });
    })
});

// @ts-ignore
app.listen(process.env.SERVER_PORT, process.env.SERVER_HOST, function() {
    console.log(`The server is listening to ${process.env.SERVER_HOST}:${process.env.SERVER_PORT}`);

    if (process.env.pm_id === undefined) {
        console.warn("You are not running the server with PM2! If the server crashes it won't start again.");
    }
});

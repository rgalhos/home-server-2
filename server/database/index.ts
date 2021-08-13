import sqlite3 from "better-sqlite3";
import IFileInfo from "../../interfaces/IFileInfo";

const CREATE_TABLES = `
CREATE TABLE IF NOT EXISTS "files" (
	"hash"	TEXT NOT NULL UNIQUE,
	"path"	TEXT NOT NULL,
	PRIMARY KEY("hash")
);
`;

export default class Database {
    private db: sqlite3.Database;

    constructor(_db: string) {
        this.db = new sqlite3(_db);

        this.db.exec(CREATE_TABLES);
    }

    get database() {
        return this.db;
    }

    public insertFilesInBulk(files: IFileInfo[]) {
        const stmt = this.db.prepare("INSERT OR IGNORE INTO files (hash, path) VALUES (@hash, @path)");

        this.db.transaction((_files) => {
            for (const { hash, path } of _files) stmt.run({ hash, path: path.replace(/\\+|\/+/g, '/') });
        })(files);
    }

    public getFileByHash(hash: string) {
        const stmt = this.db.prepare("SELECT * FROM files WHERE hash = ?");

        try {
            return stmt.get(hash);
        } catch (e) {
            return {
                error: true,
                code: e.code,
                message: e.message
            };
        }
    }
}


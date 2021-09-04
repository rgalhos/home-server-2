import * as fs from "fs";
import * as path from "path";

interface CachingConfig {
    enabled: boolean,
    overwrite: boolean,
    maxMemoryUsage: null | number,
}

export default class Caching {
    private cachedThumbs: { [hash: string]: Buffer } = {};
    private config: CachingConfig = {
        enabled: true,
        overwrite: false,
        maxMemoryUsage: null,
    };

    constructor(options?: CachingConfig) {
        if (typeof options === "object") {
            Object.assign(this.config, options);
        }
    }

    public isEnabled() {
        return this.config.enabled;
    }

    public enableCache() {
        this.config.enabled = true;
    }

    public disableCache(clearCache: boolean = true) {
        this.config.enabled = false;
        if (clearCache) this.clearCache();
    }

    public clearCache() {
        console.info("Clearing cache!");
        console.info(Object.keys(this.cachedThumbs).length, "entries in the cache");
        console.info("Total memory used by the application:", (process.memoryUsage().rss / (1024 * 1024)), "MB");

        this.cachedThumbs = {};

        try {
            global.gc();
            console.info("Forced garbage collection (node --expose-gc)");
        } catch (e) {
            console.warn("Could not force garbage collection (node was not launched with the --expose-gc flag)");
        }

        console.info("Total memory used by the application after clearing cache:", (process.memoryUsage().rss / (1024 * 1024)), "MB");
    }

    public isThumbCached(hash: string) {
        return this.cachedThumbs[hash] instanceof Buffer;
    }

    public getCachedThumb(hash: string) : Buffer | null {
        return this.cachedThumbs[hash] || null;
    }

    public storeThumb(hash: string, data: any, overwrite: boolean = this.config.overwrite) {
        return new Promise<Buffer>((resolve, reject) => {
            if (data instanceof Buffer) {
                if (!overwrite && this.isThumbCached(hash)) {
                    return resolve(this.cachedThumbs[hash]);
                }

                this.cachedThumbs[hash] = data;
                return resolve(data);
            } else if (typeof data === "string") {
                if (!path.isAbsolute(data)) {
                    // Também é usado isso em src/server/index.ts
                    data = path.join(__dirname, "../../../", process.env.THUMBNAIL_LOCATION as string, data);
                }

                if (!overwrite && this.isThumbCached(hash)) {
                    return resolve(this.cachedThumbs[hash]);
                }

                fs.readFile(data, (err, buffer) => {
                    if (err) {
                        return reject(err);
                    }

                    this.cachedThumbs[hash] = buffer;
                    return resolve(buffer);
                });
            }
        });
    }
}

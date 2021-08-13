import { createHash } from "crypto";

const base58 = require("base-58");

export default function hashFunc(path: string, created: Date | number) {
    const hash = createHash("sha512");
    hash.update(path);
    hash.update((+created).toString());
    return base58.encode(hash.digest());
}

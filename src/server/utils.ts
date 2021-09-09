import * as path from "path";

export function normalizePathParam(param: string) {
    if (param === "/")
        param = "";
    
    param = param.replace(/\\+|\/+/g, '/');

    return param;
}

export function toAbsolutePath(absoluteOrRelativePath: string) : string {
    let k = absoluteOrRelativePath;

    let isAbsolute = path.isAbsolute(k);

    k = k.replace(/\/+|\\+/g, '/');

    if (k.startsWith('/')
        && !k.startsWith('/bin/')
        && !k.startsWith('/boot/')
        && !k.startsWith('/dev/')
        && !k.startsWith('/etc/')
        && !k.startsWith('/home/')
        && !k.startsWith('/lib/')
        && !k.startsWith('/media/')
        && !k.startsWith('/mnt/')
        && !k.startsWith('/proc/')
        && !k.startsWith('/root/')
        && !k.startsWith('/run/')
        && !k.startsWith('/sbin/')
        && !k.startsWith('/srv/')
        && !k.startsWith('/sys/')
        && !k.startsWith('/temp/')
        && !k.startsWith('/tmp/')
        && !k.startsWith('/usr/')
        && !k.startsWith('/var/')
    ) {
        isAbsolute = false;
    }

    if (isAbsolute) {
        return k;
    } else {
        return path.join(process.env.FILESYSTEM_ROOT as string, k);
    }
}

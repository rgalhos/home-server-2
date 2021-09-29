export default interface IFileInfo {
    hash: string,
    thumbnail: string | null,
    name: string,
    path: string,
    size: number,
    mimeType: string | false,
    accessTime: number, // atime
    lastModified: number, // mtime
    created: number, // birthtime
    type: 'file' | 'image' | 'video',
};

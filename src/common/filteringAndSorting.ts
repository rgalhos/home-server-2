import ESortingOptions from "./interfaces/ESortingOptions";
import IFileInfo from "./interfaces/IFileInfo";
import ISearchFilter from "./interfaces/ISearchFilters";

export function normalizeSearchQuery(str: string) {
    return str.toLowerCase()
        .replace(/[áàãâä]/g, 'a')
        .replace(/[éèêë]/g, 'e')
        .replace(/[íìîï]/g, 'i')
        .replace(/[óòõôö]/g, 'o')
        .replace(/[úùûü]/g, 'u')
        .replace(/ç/g, 'c')
        // eslint-disable-next-line
        .replace(/[\[\]\(\)\{\}\$\-~\?#\*\!'"\+=_;\.,:<> ºª§]/g, '')
    ;
}

export const fileFiltering = {
    filesOnly: (file: IFileInfo) => file.type === "file" || file.thumbnail === null,
    imagesOnly: (file: IFileInfo) => file.type === "image" && !!file.thumbnail,
    videosOnly: (file: IFileInfo) => file.type === "video" && !!file.thumbnail,
};

export const fileSorting: { [k: string]: (a: IFileInfo, b: IFileInfo) => number } = {
    byName: (a, b) => a.name.toLowerCase().localeCompare(b.name.toLowerCase()),
    byModificationTimeAsc: (a, b) => a.lastModified - b.lastModified,
    byModificationTimeDesc: (a, b) => b.lastModified - a.lastModified,
    byCreationTimeAsc: (a, b) => a.created - b.created,
    byCreationTimeDesc: (a, b) => b.created - a.created,
    bySizeAsc: (a, b) => a.size - b.size,
    bySizeDesc: (a, b) => b.size - a.size,
};

export function applyFilters(arr: IFileInfo[], filters: ISearchFilter) {
    let _ret: { files: IFileInfo[], images: IFileInfo[], videos: IFileInfo[] } = { files: [], images: [], videos: [] };

    if (!filters.type) {
        filters.type = [ "file", "image", "video" ];
    } else if (!Array.isArray(filters.type)) {
        filters.type = [ filters.type ];
    }

    // Filter types
    if (filters.type.includes("file"))
        _ret.files = arr.filter(fileFiltering.filesOnly);
    
    if (filters.type.includes("image"))
        _ret.images = arr.filter(fileFiltering.imagesOnly);

    if (filters.type.includes("video"))
        _ret.videos = arr.filter(fileFiltering.videosOnly);

        // Search files by name
    if (filters.string) {
        /* Search by regular expression */
        let q = filters.string.match(/^exp(:? *)(.+)$/i)?.[2];

        if (q) {
            let exp = new RegExp(q, "i");

            _ret.files = _ret.files.filter(({ name }) => exp.test(name));
            _ret.images = _ret.images.filter(({ name }) => exp.test(name));
            _ret.videos = _ret.videos.filter(({ name }) => exp.test(name));
        } else {
            filters.string = normalizeSearchQuery(filters.string);
            
            _ret.files = _ret.files.filter(({ name }) => normalizeSearchQuery(name).includes(filters.string as string));
            _ret.images = _ret.images.filter(({ name }) => normalizeSearchQuery(name).includes(filters.string as string));
            _ret.videos = _ret.videos.filter(({ name }) => normalizeSearchQuery(name).includes(filters.string as string));
        }
    }

    // Sort
    _ret.files = applySort(_ret.files, filters?.sort?.file);
    _ret.images = applySort(_ret.images, filters?.sort?.image);
    _ret.videos = applySort(_ret.videos, filters?.sort?.video);

    return _ret;
}

export function applySort(files: IFileInfo[], sort: ESortingOptions | undefined) {
    if (sort === ESortingOptions["modified_asc"]) {
        files = files.sort(fileSorting.byModificationTimeAsc);
    } else if (sort === ESortingOptions["modified_desc"]) {
        files = files.sort(fileSorting.byModificationTimeDesc);
    } else if (sort === ESortingOptions["created_asc"]) {
        files = files.sort(fileSorting.byCreationTimeAsc);
    } else if (sort === ESortingOptions["created_desc"]) {
        files = files.sort(fileSorting.byCreationTimeDesc);
    } else if (sort === ESortingOptions["size_asc"]) {
        files = files.sort(fileSorting.bySizeAsc);
    } else if (sort === ESortingOptions["size_desc"]) {
        files = files.sort(fileSorting.bySizeDesc);
    } else {
        // sort by name is fallback
        files = files.sort(fileSorting.byName);
    }

    return files;
}

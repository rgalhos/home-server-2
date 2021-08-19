const storage = window.localStorage;
export { storage };

const storageProps = [
    "sortImagesBy",
    "sortFilesBy",
    "sortDirectoriesBy"
]

export function check() {
    if (storage.length !== storageProps.length) {
        storage.clear();

        storage.setItem("sortImagesBy", "name");
        storage.setItem("sortFilesBy", "name");
        storage.setItem("sortDirectoriesBy", "name");
    }
}

export function getImageSorting() {
    let s = storage.getItem("sortImagesBy") as string;
    let valid = [ "created_asc", "created_desc", "name" ];
    if (valid.indexOf(s) === -1) {
        storage.setItem("sortImagesBy", s = "name");
    }
    return s;
}

export function getFilesSorting() {
    let s = storage.getItem("sortFilesBy") as string;
    let valid = [ "created_asc", "created_desc", "name", "size_asc", "size_desc" ];
    if (valid.indexOf(s) === -1) {
        storage.setItem("sortFilesBy", s = "name");
    }
    return s;
}

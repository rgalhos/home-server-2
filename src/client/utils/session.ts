const storage = window.localStorage;
export { storage };

const THEME_LIST = [ "dark", "light" ];

const defaultConfigs = {
    theme: "dark",
    sortImagesBy: "modified_desc",
    sortFilesBy: "name",
    sortDirectoriesBy: "name",
};

export function check() : void;
export function check(s?: { prefersDarkMode?: boolean }) {
    s = s || {};

    if (storage.length !== Object.keys(defaultConfigs).length) {
        storage.clear();

        let theme = s.prefersDarkMode === false ? "light" : "dark";

        let conf = Object.assign({}, defaultConfigs, {
            theme,
        });

        Object.entries(conf).forEach(([k, v]) => storage.setItem(k, v));
    }
}

export function getImageSorting() {
    let s = storage.getItem("sortImagesBy") as string;
    let valid = [ "created_asc", "created_desc", "modified_asc", "modified_desc", "name" ];
    if (valid.indexOf(s) === -1) {
        storage.setItem("sortImagesBy", s = defaultConfigs.sortImagesBy);
    }
    return s;
}

export function getFilesSorting() {
    let s = storage.getItem("sortFilesBy") as string;
    let valid = [ "created_asc", "created_desc", "name", "size_asc", "size_desc" ];
    if (valid.indexOf(s) === -1) {
        storage.setItem("sortFilesBy", s = defaultConfigs.sortFilesBy);
    }
    return s;
}

export function getUserTheme() {
    let s = storage.getItem("theme") as string;
    if (THEME_LIST.indexOf(s) === -1) {
        storage.setItem("sortFilesBy", s = defaultConfigs.theme);
    }
    return s;
}

export function setUserTheme(theme: string) {
    if (THEME_LIST.indexOf(theme) !== -1) {
        storage.setItem("theme", theme);
        return theme;
    }
    return false;
}

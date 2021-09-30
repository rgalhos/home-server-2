import ESortingOptions from "../../common/interfaces/ESortingOptions";

const storage = window.localStorage;
export { storage };

const THEME_LIST = [ "dark", "light" ];

const defaultConfigs = {
    theme: "dark",
    sortImagesBy: "modified_desc",
    sortFilesBy: "name",
    sortVideosBy: "name",
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

export function getImageSorting() : ESortingOptions {
    let s = storage.getItem("sortImagesBy") as string;
    if (!Object.values(ESortingOptions).includes(s)) {
        storage.setItem("sortImagesBy", s = defaultConfigs.sortImagesBy);
    }
    // @ts-ignore
    return ESortingOptions[s];
}

export function getFilesSorting() : ESortingOptions {
    let s = storage.getItem("sortFilesBy") as string;
    if (!Object.values(ESortingOptions).includes(s)) {
        storage.setItem("sortFilesBy", s = defaultConfigs.sortFilesBy);
    }
    // @ts-ignore
    return ESortingOptions[s];
}

export function getVideoSorting() : ESortingOptions {
    let s = storage.getItem("sortVideosBy") as string;
    if (!Object.values(ESortingOptions).includes(s)) {
        storage.setItem("sortVideosBy", s = defaultConfigs.sortVideosBy);
    }
    // @ts-ignore
    return ESortingOptions[s];
}

export function getUserTheme() {
    let s = storage.getItem("theme") as string;
    if (THEME_LIST.indexOf(s) === -1) {
        storage.setItem("theme", s = defaultConfigs.theme);
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

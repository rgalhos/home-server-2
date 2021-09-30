import IFileInfo from "./IFileInfo";
import ESortingOptions from "./ESortingOptions";

export default interface ISearchFilters {
    type?: IFileInfo["type"] | IFileInfo["type"][],
    string?: string,
    sort?: {
        image?: ESortingOptions,
        video?: ESortingOptions,
        file?: ESortingOptions,
    },
    start?: number,
    end?: number,
};

import React from "react";
import { Box } from "@material-ui/core";
import FileListTable from "./FileListTable/FileListTable";
import IFileInfo from "../../../../interfaces/IFileInfo";

interface FileListProps {
    path: string,
    fileList: IFileInfo[],
};

export default class FileList extends React.Component<FileListProps> {
    render() {
        return (
            <Box className="items-box">
                <h2>
                    Files
                </h2>

                <FileListTable
                    files={this.props.fileList}
                />
            </Box>
        );
    }
}
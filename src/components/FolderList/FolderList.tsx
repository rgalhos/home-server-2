import React from "react";

import { Box, Link } from "@material-ui/core";
import KeyboardReturnIcon from '@material-ui/icons/KeyboardReturn';
import FolderListTable from "../FolderListTable/FolderListTable";
import IFolderOverview from "../../../interfaces/IFolderOverview";

interface FolderListProps {
    path: string,
    folderList: IFolderOverview[],
    changeDirectory: (path: string) => void,
};

interface FolderListStates {
    folderList: IFolderOverview[],
    error: boolean,
    errorMessage: string,
    ready: boolean,
};

export default class FolderList extends React.Component<FolderListProps, FolderListStates> {
    path: string;

    constructor(props: FolderListProps) {
        super(props);

        this.state = {
            folderList: [],
            error: false,
            errorMessage: "",
            ready: false,
        };

        this.path = this.props.path;
    }

    get parentFolder() {
        return this.props.path.substr(0, this.path.lastIndexOf('/')) || '/';
    }

    render() {
        return (
            <Box className="items-box">
                <h2>
                    Directories of <code>{this.props.path}</code>
                    <Link
                        href={'#' + this.parentFolder}
                        style={{ float: "right" }}
                        color="inherit"
                        underline="always"
                        onClick={() => this.props.changeDirectory(this.parentFolder)}
                    >
                        Back
                        <KeyboardReturnIcon />
                    </Link>
                </h2>

                <FolderListTable
                    folders={this.props.folderList}
                    changeDirectory={this.props.changeDirectory}
                />
            </Box>
        );
    }
}

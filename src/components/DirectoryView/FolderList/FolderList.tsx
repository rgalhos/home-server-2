import React from "react";

import { Box } from "@material-ui/core";
import FolderListTable from "./FolderListTable/FolderListTable";
import IFolderOverview from "../../../../interfaces/IFolderOverview";
import NavigationBreadcrumb from "../NavigationBreadcrumb/NavigationBreadcrumb";

interface FolderListProps {
    path: string,
    folderList: IFolderOverview[],
    changeDirectory: (path: string) => void,
}

interface FolderListStates {
    folderList: IFolderOverview[],
    error: boolean,
    errorMessage: string,
    ready: boolean,
}

export default class FolderList extends React.Component<FolderListProps, FolderListStates> {
    constructor(props: FolderListProps) {
        super(props);

        this.state = {
            folderList: [],
            error: false,
            errorMessage: "",
            ready: false,
        };
    }
    render() {
        return (
            <Box className="items-box">
                <NavigationBreadcrumb
                    changeDirectory={this.props.changeDirectory}
                    path={this.props.path}
                />

                <FolderListTable
                    folders={this.props.folderList}
                    changeDirectory={this.props.changeDirectory}
                />
            </Box>
        );
    }
}

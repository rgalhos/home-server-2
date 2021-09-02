import React from "react";

import { Link, ListItem, ListItemAvatar, Avatar, ListItemText, List } from "@material-ui/core";
import FolderIcon from '@material-ui/icons/Folder';
import { bytesToSizeString } from "../../../utils/utils";
import IFolderOverview from "../../../../common/interfaces/IFolderOverview";

interface FolderListTableProps {
    folders: IFolderOverview[]
    changeDirectory: (path: string) => void,
};

const Item = (props: any) => (
    <ListItem color="inherit" component={Link} href={props.href} onClick={props.onClick}>
        <ListItemAvatar><Avatar><FolderIcon /></Avatar></ListItemAvatar>
        <ListItemText primary={props.primary} secondary={props.secondary} />
    </ListItem>
);

export default class FolderListTable extends React.Component<FolderListTableProps, {}> {
    render() {
        if (this.props.folders.length === 0) {
            return ( <></> );
        }

        let rows = this.props.folders
        // @ts-ignore
        .sort((a, b) => {
            if (a.name > b.name) return 1;
            else if (a.name < b.name) return -1;
            return 0;
        })
        .map(folder => {
            folder.path = '/' + folder.path;
            return folder;
        })
        .map((folder) => (
            <Item
                key={folder.name}
                primary={folder.name}
                secondary={(
                    <span>
                        {folder.noFiles} files
                        <span>&nbsp;&nbsp;&nbsp;&#9679;&nbsp;&nbsp;&nbsp;</span>
                        {bytesToSizeString(folder.size)}
                    </span>
                )}
                href={'#' + folder.path.replace(/\\+|\/+/g, '/')}
                onClick={() => this.props.changeDirectory(folder.path)}
            />
        ));

        return (
            <List dense={true}>
                {rows}
            </List>
        );
    }
}
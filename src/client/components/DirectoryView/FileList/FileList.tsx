import React from "react";

import * as mime from "mime-types";
import { Link, List, ListItem, ListItemAvatar, Avatar, ListItemText } from "@material-ui/core";
import { bytesToSizeString } from "../../../utils/utils";
import IFileInfo from "../../../../common/interfaces/IFileInfo";
import { getFilesSorting } from "../../../utils/session";
import MovieCreationIcon from '@material-ui/icons/MovieCreation';
import PictureAsPdfIcon from '@material-ui/icons/PictureAsPdf';
import DescriptionIcon from '@material-ui/icons/Description';
import ArchiveIcon from '@material-ui/icons/Archive';
import CodeIcon from '@material-ui/icons/Code';
import AdbIcon from '@material-ui/icons/Adb';
import * as mimeUtils from "../../../utils/mimeTypes"

interface FileListProps {
    files: IFileInfo[],
}

function getIcon(name: string) {
    let icons = {
        "video": ( <MovieCreationIcon /> ),
        "application/zip": ( <ArchiveIcon /> ),
        "application/vnd.rar": ( <ArchiveIcon /> ),
        "application/x-7z-compressed": ( <ArchiveIcon /> ),
        "application/gzip": ( <ArchiveIcon /> ),
        "application/x-tar": ( <ArchiveIcon /> ),
        "application/x-lzh-compressed": ( <ArchiveIcon /> ),
        "application/x-bzip2": ( <ArchiveIcon /> ),
        "application/pdf": ( <PictureAsPdfIcon /> ),
        "application/epub+zip": ( <PictureAsPdfIcon /> ),
        "application/vnd.android.package-archive": ( <AdbIcon /> ),
        "text/x-c": ( <CodeIcon /> ),
        "application/javascript": ( <CodeIcon /> ),
        "text/jsx": ( <CodeIcon /> ),
        "application/json": ( <CodeIcon /> ),
        "application/xml": ( <CodeIcon /> ),
    };

    let _mime = mime.lookup(name) as string;

    if (mimeUtils.isVideo(name)) {
        return icons.video;
    } else if (icons.hasOwnProperty(_mime)) {
        // @ts-ignore
        return icons[_mime];
    } else {
        return ( <DescriptionIcon /> );
    }
}

const Item = (props: any) => (
    <ListItem color="inherit" component={Link} href={props.href}>
        <ListItemAvatar><Avatar>{props.avatar}</Avatar></ListItemAvatar>
        <ListItemText primary={props.primary} secondary={props.secondary} />
    </ListItem>
);

export default class FileList extends React.Component<FileListProps, {}> {
    render() {
        if (this.props.files.length === 0) {
            return ( <></> );
        }

        // Sort by name
        var sortingFn : (a: IFileInfo, b: IFileInfo) => number = (a, b) => {
            let aName = a.name.toLowerCase();
            let bName = b.name.toLowerCase();
            if (aName > bName) return 1;
            else if (aName < bName) return -1;
            return 0;
        };

        let sorting = getFilesSorting();

        if (sorting === "created_asc") {
            sortingFn = (a, b) => a.created - b.created;
        } else if (sorting === "created_desc") {
            sortingFn = (a, b) => b.created - a.created;
        } else if (sorting === "size_asc") {
            sortingFn = (a, b) => a.size - b.size;
        } else if (sorting === "size_desc") {
            sortingFn = (a, b) => b.size - a.size;
        }

        let rows = this.props.files
        // @ts-ignore
        .sort(sortingFn)
        .map((file) => {
            file.path = '/' + file.path;
            return file;
        })
        .map((file) => (
            <Item
                key={file.hash}
                data-hash={file.hash}
                avatar={getIcon(file.name)}
                primary={file.name}
                secondary={bytesToSizeString(file.size)}
                href={"/$preview/" + file.hash}
            />
        ));

        return (
            <List dense={true}>
                {rows}
            </List>
        );
    }
}
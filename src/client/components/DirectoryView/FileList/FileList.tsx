import React from "react";

import * as mime from "mime-types";
import { Link, List, ListItem, ListItemAvatar, Avatar, ListItemText } from "@mui/material";
import { bytesToSizeString, isOnMobile } from "../../../utils/utils";
import IFileInfo from "../../../../common/interfaces/IFileInfo";
import MovieCreationIcon from '@mui/icons-material/MovieCreation';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import DescriptionIcon from '@mui/icons-material/Description';
import ArchiveIcon from '@mui/icons-material/Archive';
import CodeIcon from '@mui/icons-material/Code';
import AdbIcon from '@mui/icons-material/Adb';
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

        let rows = this.props.files
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
            <List dense={true} style={{ overflowX: isOnMobile() ? "scroll" : "hidden" }}>
                {rows}
            </List>
        );
    }
}
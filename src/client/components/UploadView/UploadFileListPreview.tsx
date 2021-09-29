import React from "react";
import * as mime from "mime";
import { List, ListItem, ListItemAvatar, Avatar, ListItemText, ListSubheader } from "@mui/material";
import MovieCreationIcon from '@mui/icons-material/MovieCreation';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import DescriptionIcon from '@mui/icons-material/Description';
import ArchiveIcon from '@mui/icons-material/Archive';
import CodeIcon from '@mui/icons-material/Code';
import AdbIcon from '@mui/icons-material/Adb';
import * as mimeUtils from "../../utils/mimeTypes";
import { bytesToSizeString } from "../../utils/utils";

interface UploadFileListPreviewProps {
    files: FileList | null,
};

/*
 * Essa função também aparece no FileList/FileList.tsx
 * TO DO: Reescrever essa função nojenta e coloca um arquivo separado
 *        pra esse e o outro componente ai poderem pegar
 * O tipo "File" do "FileList" (n é o mesmo FileList daí de cima) já
 * retorna o mime type do arquivo
 */
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

export default class UploadFileListPreview extends React.Component<UploadFileListPreviewProps, {}> {
    render() {
        console.dir(this.props.files)
        if (this.props.files === null || this.props.files?.length === 0) {
            return ( <></> );
        }

        const files = this.props.files as FileList;

        return (
            <List dense={true} subheader={<ListSubheader> {files.length} file{files.length > 1 ? 's' : ''} </ListSubheader>}>
                {
                    Array.from(files).map((file, i) => (
                        <ListItem key={i}>
                            <ListItemAvatar><Avatar>{getIcon(file.name)}</Avatar></ListItemAvatar>
                            <ListItemText primary={file.name} secondary={bytesToSizeString(file.size)} />
                        </ListItem>
                    ))
                }
            </List>
        );
    }
}
import React from "react";

import * as mime from "mime-types";
import { withStyles, Theme, createStyles  } from '@material-ui/core/styles';
import { Box, Table, TableBody, TableCell, TableContainer, TableRow, Paper, Link } from "@material-ui/core";
import { bytesToSizeString } from "../../../utils/utils";
import IFileInfo from "../../../../interfaces/IFileInfo";
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

const StyledTableRow = withStyles((theme: Theme) =>
    createStyles({
        root: {
            "&:nth-of-type(odd)": {
                backgroundColor: "rgba(121, 75, 196, .3)",
            },
        },
    }),
)(TableRow);

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
        .map(file => {
            file.path = '/' + file.path;
            return file;
        })
        .map(file => (
            <StyledTableRow hover key={file.hash}
                style={{ cursor: "pointer" }}
                data-hash={file.hash}
            >
                <TableCell component="th" scope="row" style={{ display: "flex", flexDirection: "row", alignItems: "center"}}>
                    {getIcon(file.name)}
                    <Box>
                        <Link href={"/$preview/" + file.hash} color="inherit" underline="none">
                            {file.name}<br />
                            <small>{bytesToSizeString(file.size)}</small>
                        </Link>
                    </Box>
                </TableCell>
            </StyledTableRow>
        ));

        return (
            <TableContainer component={Paper}>
                <Table aria-label="simple table" size="small">
                    <TableBody>
                        {rows}
                    </TableBody>
                </Table>
            </TableContainer>
        );
    }
}
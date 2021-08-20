import React from "react";

import { Box, Table, TableBody, TableCell, TableContainer, TableRow, Paper } from "@material-ui/core";
import IFileInfo from "../../../../interfaces/IFileInfo";
import { bytesToSizeString } from "../../../utils/utils";
import InsertDriveFileIcon from '@material-ui/icons/InsertDriveFile';
import PhotoSizeSelectLargeIcon from '@material-ui/icons/PhotoSizeSelectLarge';
import DeveloperModeIcon from '@material-ui/icons/DeveloperMode';
import FolderIcon from '@material-ui/icons/Folder';
import AddIcon from '@material-ui/icons/Add';
import CreateIcon from '@material-ui/icons/Create';
import AccessTimeIcon from '@material-ui/icons/AccessTime';

interface MediaPreviewInfoProps {
    info: IMediaPreviewInfo,
}

export interface IMediaPreviewInfo extends IFileInfo {
    width?: number,
    height?: number,
}

// Ugly as fuck
function colorizedHash(hash: string) {
    let start = hash.substr(0, 4);
    let mid = hash.slice(4, -4);
    let end = hash.substr(-4);

    let orig = mid.match(/.{8}/g);
    // @ts-ignore
    let spl = orig.map(x => x.split('').map(y => y.charCodeAt(0)).reduce((a, b) => (a * b) % 0xFFFFFF)).map(x => '#' + x.toString(16))

    return (
        <span>
            {start}
            {
                // @ts-ignore
                spl.map((x, i) => (<div style={{ background: x, color: x, width: "16px", display: "inline-block" }} key={orig[i]}>
                    <span style={{fontSize: "0px"}}>
                        { /* @ts-ignore */ }
                        {orig[i]}
                    </span>
                </div>))
            }
            {end}
        </span>
    );
}

export default function MediaPreviewInfo(props: MediaPreviewInfoProps) {
    const info = props.info;

    const Row = (props: any) => (
        <TableRow>
            <TableCell scope="row" {...props}>
                {props.children}
            </TableCell>
        </TableRow>
    );

    let dimensions = ( <></> )
    if (info.width && info.height) {
        dimensions = (
            <TableRow>
                <TableCell>
                    <PhotoSizeSelectLargeIcon /> {info.width}x{info.height}
                </TableCell>
            </TableRow>
        )
    }
    
    const tableRows = (
        <>
            <Row>
                <InsertDriveFileIcon /> {info.name}
                <br />
                <InsertDriveFileIcon style={{ visibility: "hidden" }} /> {bytesToSizeString(info.size)}
            </Row>
            {dimensions}
            <Row>
                <FolderIcon /> {info.path}
            </Row>
            <Row style={{ lineHeight: "200%" }}>
                <AddIcon /> {formatDate(+info.created)}
                <br />
                <CreateIcon /> {formatDate(+info.lastModified)}
                <br />
                <AccessTimeIcon /> {formatDate(+info.accessTime)}
            </Row>
            <Row>
                <DeveloperModeIcon /> {colorizedHash(info.hash)}
            </Row>
        </>
    );

    return (
        <Box>
            <TableContainer component={Paper} id="media-preview-info-table">
                <Table aria-label="simple table" size="medium">
                    <TableBody>
                        {tableRows}
                    </TableBody>
                </Table>
            </TableContainer>
        </Box>
    );
}

function formatDate(date: number) : string {
    return new Date(date).toLocaleString();
}

import React from "react";

import { Box, Button, Table, TableBody, TableCell, TableContainer, TableRow, Paper } from "@material-ui/core";
import IFileInfo from "../../../interfaces/IFileInfo";
import { bytesToSizeString } from "../../utils/utils";

interface MediaPreviewInfoProps {
    info: IMediaPreviewInfo,
};

export interface IMediaPreviewInfo extends IFileInfo {
    width?: number,
    height?: number,
};

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
    const downloadButton = (
        <Button variant="contained" href={"/~" + info.path} download={info.name} color="primary" id="download-button">
            Download
        </Button>
    );

    const rows: [string | JSX.Element, string | JSX.Element][] = [
        [ "Download", downloadButton ],
        [ "Name", info.name ]
    ];
    
    if (info.width && info.height) {
        rows.push([ "Dimensions", info.width + "x" + info.height ]);
    }

    rows.push(
        [ "Size", bytesToSizeString(info.size) ],
        [ "Path", info.path ],
        [ "Created", formatDate(+info.created) ],
        [ "Last Modified", formatDate(+info.lastModified) ],
        [ "Last Access", formatDate(+info.accessTime) ],
        // @ts-ignore
        [ "Hash", colorizedHash(info.hash) ]
    );
    
    const tableRows = rows.map(([ desc, val ], i) => (
        <TableRow key={i} data-key={desc} data-value={val}>
            <TableCell scope="row">
                {desc}
            </TableCell>
            <TableCell>
                {val}
            </TableCell>
        </TableRow>
    ));

    return (
        <Box>
            <TableContainer component={Paper} id="media-preview-info-table">
                <Table aria-label="simple table">
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

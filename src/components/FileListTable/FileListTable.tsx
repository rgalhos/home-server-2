import React from "react";
//import { Link } from "react-router-dom";

import { withStyles, Theme, createStyles  } from '@material-ui/core/styles';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Link } from "@material-ui/core";
import DescriptionIcon from '@material-ui/icons/Description';
import InsertDriveFileIcon from '@material-ui/icons/InsertDriveFile';
import { bytesToSizeString } from "../../utils/utils";
import IFileInfo from "../../../interfaces/IFileInfo";

interface FileListTableProps {
    files: IFileInfo[]
};

const StyledTableRow = withStyles((theme: Theme) =>
    createStyles({
        root: {
            "&:nth-of-type(odd)": {
                backgroundColor: "rgba(121, 75, 196, .3)",
            },
        },
    }),
)(TableRow);

export default class FileListTable extends React.Component<FileListTableProps, {}> {
    render() {
        let rows = this.props.files
        // @ts-ignore
        .sort((a, b) => {
            let aName = a.name.toLowerCase();
            let bName = b.name.toLowerCase();
            if (aName > bName) return 1;
            else if (aName < bName) return -1;
            return 0;
        })
        .map(file => {
            file.path = '/' + file.path;
            return file;
        })
        .map(file => (
            <StyledTableRow hover key={file.hash}
                style={{ cursor: "pointer" }}
                data-hash={file.hash}
            >
                <TableCell component="th" scope="row">
                    <DescriptionIcon fontSize="small" />
                    <Link href={"/$preview/" + file.hash} color="inherit" underline="none">
                        {file.name}
                    </Link>
                </TableCell>
                <TableCell align="right">
                    {bytesToSizeString(file.size)}
                </TableCell>
            </StyledTableRow>
        ));

        return (
            <TableContainer component={Paper}>
                <Table aria-label="simple table">
                    <TableHead>
                        <TableRow>
                            <TableCell align="left">
                                <InsertDriveFileIcon fontSize="small" />
                                File&nbsp;name
                            </TableCell>
                            <TableCell align="right">
                                Size
                            </TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {rows}
                    </TableBody>
                </Table>
            </TableContainer>
        );
    }
}
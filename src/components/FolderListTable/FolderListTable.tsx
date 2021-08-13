import React from "react";

import { withStyles, Theme, createStyles } from '@material-ui/core/styles';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Link } from "@material-ui/core";
import FolderOpenIcon from '@material-ui/icons/FolderOpen';
import FolderIcon from '@material-ui/icons/Folder';
import { bytesToSizeString } from "../../utils/utils";
import IFolderOverview from "../../../interfaces/IFolderOverview";

interface FolderListTableProps {
    folders: IFolderOverview[]
    changeDirectory: (path: string) => void,
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

export default class FolderListTable extends React.Component<FolderListTableProps, {}> {
    render() {
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
        .map(folder => (
            <StyledTableRow hover key={folder.name}
                style={{ cursor: "pointer" }}
            >
                <TableCell component="th" scope="row">
                    <FolderIcon fontSize="small" />
                    <Link 
                        href={'#' + folder.path.replace(/\\+|\/+/g, '/')}
                        onClick={() => this.props.changeDirectory(folder.path)}
                        color="inherit"
                    >
                        /{folder.name}
                    </Link>
                </TableCell>
                <TableCell>
                    {folder.noFiles}
                </TableCell>
                <TableCell>
                    {bytesToSizeString(folder.size)}
                </TableCell>
            </StyledTableRow>
        ));

        return (
            <TableContainer component={Paper}>
                <Table aria-label="simple table">
                    <TableHead>
                        <TableRow>
                            <TableCell align="left">
                                <FolderOpenIcon fontSize="small" />
                                Directory
                            </TableCell>
                            <TableCell>
                                No.&nbsp;Files
                            </TableCell>
                            <TableCell>
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
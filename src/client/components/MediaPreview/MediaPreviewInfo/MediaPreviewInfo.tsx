import React from "react";

import { Box, List, ListItem, ListItemAvatar, Avatar, ListItemText, Divider, ListSubheader, Theme, makeStyles, createStyles } from "@material-ui/core";
import IFileInfo from "../../../../common/interfaces/IFileInfo";
import { bytesToSizeString } from "../../../utils/utils";
import InsertDriveFileIcon from '@material-ui/icons/InsertDriveFile';
import DeveloperModeIcon from '@material-ui/icons/DeveloperMode';
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

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        root: {
            width: '100%',
            backgroundColor: theme.palette.background.paper,
        },
        nested: {
            paddingLeft: theme.spacing(4),
        },
    }),
);

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

const Item = (props: any) => (
    <ListItem>
        {props.avatar ? ( <ListItemAvatar><Avatar>{props.avatar}</Avatar></ListItemAvatar>) : ( <></> )}
        <ListItemText primary={props.primary} secondary={props.secondary} />
    </ListItem>
);

export default function MediaPreviewInfo(props: MediaPreviewInfoProps) {
    const classes = useStyles();
    const info = props.info;

    let details = ( <>{bytesToSizeString(info.size)}</> )
    if (info.width && info.height) {
        details = (
            <>
                {details}
                <span>&nbsp;&nbsp;&nbsp;&#9679;&nbsp;&nbsp;&nbsp;</span>
                {info.width}x{info.height}
                <span>&nbsp;&nbsp;&nbsp;&#9679;&nbsp;&nbsp;&nbsp;</span>
                {(info.width * info.height / 1e6).toFixed(1)} MP
            </>
        );
    }

    return (
        <Box>
            <List dense={true} subheader={<ListSubheader>Details</ListSubheader>} className={classes.root}>
                <Item avatar={<InsertDriveFileIcon />} primary={info.name} secondary={details} />
                <Item avatar={<DeveloperModeIcon />} primary={colorizedHash(info.hash)} />
            </List>
            <Divider />
            <List dense={true} className={classes.root}>
                <Item avatar={<AddIcon />} primary={formatDate(+info.created)} />
                <Item avatar={<CreateIcon />} primary={formatDate(+info.lastModified)} />
                <Item avatar={<AccessTimeIcon />} primary={formatDate(+info.accessTime)} />
            </List>
        </Box>
    );
}

function formatDate(date: number) : string {
    return new Date(date).toLocaleString();
}

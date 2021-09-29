import React from "react";
import { Box, BottomNavigation, BottomNavigationAction } from "@mui/material";
import { IMediaPreviewInfo } from "../../MediaPreviewInfo/MediaPreviewInfo";
import GetAppIcon from '@mui/icons-material/GetApp';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';

interface UnsupportedFormatControllerProps {
    info: IMediaPreviewInfo,
}

export default function UnsupportedFormatController(props: UnsupportedFormatControllerProps) {
    function downloadFile() {
        const downloadLink = document.createElement("a");
        downloadLink.href = "/~/" + props.info.path;
        downloadLink.download = props.info.name;
        downloadLink.dispatchEvent(new MouseEvent("click", { bubbles: true, cancelable: true, view: window, }));
        downloadLink.remove();
    }

    function handleAction(action: string) {
        if (action === "download") {
            downloadFile();
        }
    }

    return (
        <Box className="media-controls">
            <BottomNavigation onChange={(e, action) => handleAction(action)}>
                <BottomNavigationAction label="Download" value="download" icon={<GetAppIcon />} />
                <BottomNavigationAction label="Delete" value="delete" icon={<DeleteForeverIcon />} />
            </BottomNavigation>
        </Box>
    );
}

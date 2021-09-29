import React from "react";
import { Box, BottomNavigation, BottomNavigationAction, Button } from "@mui/material";
import { IMediaPreviewInfo } from "../../MediaPreviewInfo/MediaPreviewInfo";
import StyledButtonGroup from "../StyledButtonGroup";
import GetAppIcon from '@mui/icons-material/GetApp';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';

interface IImageControllerProps {
    info: IMediaPreviewInfo,
    mediaRef: () => React.RefObject<HTMLImageElement>,
    setBackground?: (bg: string) => void,
}

export default function ImageController(props: IImageControllerProps) {
    let changeBackgroundButtonGroup = ( <></> );

    if (!!props.setBackground) {
        const setBackground = props.setBackground as (bg: string) => void;

        changeBackgroundButtonGroup = (
            <StyledButtonGroup variant="text" color="primary" aria-label="text primary button group" className="bg-buttons-group margin-5">
                <Button style={{ background: "#000" }} onClick={() => setBackground("#000")}>&nbsp;</Button>
                <Button style={{ background: "#fff" }} onClick={() => setBackground("#fff")}>&nbsp;</Button>
                <Button style={{ background: "url('/transp.png') repeat" }} onClick={() => setBackground("url('/transp.png') repeat")}>&nbsp;</Button>
            </StyledButtonGroup>
        );
    }

    function downloadImage() {
        const downloadLink = document.createElement("a");
        downloadLink.href = "/~/" + props.info.path;
        downloadLink.download = props.info.name;
        downloadLink.dispatchEvent(new MouseEvent("click", { bubbles: true, cancelable: true, view: window, }));
        downloadLink.remove();
    }

    function handleAction(action: string) {
        if (action === "download") {
            downloadImage();
        }
    }

    return (
        <Box className="media-controls">
            {changeBackgroundButtonGroup}

            <BottomNavigation onChange={(e, action) => handleAction(action)}>
                <BottomNavigationAction label="Download" value="download" icon={<GetAppIcon />} />
                <BottomNavigationAction label="Delete" value="delete" icon={<DeleteForeverIcon />} />
            </BottomNavigation>
        </Box>
    );
}

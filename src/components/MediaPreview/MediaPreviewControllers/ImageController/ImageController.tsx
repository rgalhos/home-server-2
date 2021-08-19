import React from "react";
import { Box, Button } from "@material-ui/core";
import { IMediaPreviewInfo } from "../../MediaPreviewInfo/MediaPreviewInfo";
import StyledButtonGroup from "../StyledButtonGroup";

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

    return (
        <Box className="media-controls">
            {changeBackgroundButtonGroup}
        </Box>
    );
}

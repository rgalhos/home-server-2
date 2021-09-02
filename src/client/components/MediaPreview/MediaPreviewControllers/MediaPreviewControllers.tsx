import React from "react";
import { IMediaPreviewInfo } from "../MediaPreviewInfo/MediaPreviewInfo";
import * as mime from "../../../utils/mimeTypes";
import VideoController from "./VideoController/VideoController";
import ImageController from "./ImageController/ImageController";
import UnsupportedFormatController from "./UnsupportedFormatController/UnsupportedFormatController";

interface IMediaPreviewControllersProps {
    info: IMediaPreviewInfo,
    mediaRef: () => React.RefObject<HTMLVideoElement | HTMLImageElement>,
    // image
    setBackground?: (bg: string) => void,
    setImageDimensions?: (dimensions: { width: number, height: number }) => void,
}

export default function MediaPreviewControllers(props: IMediaPreviewControllersProps) {
    // is video
    if (mime.isVideo(props.info.name)) {
        return (
            <VideoController
                info={props.info}
                mediaRef={props.mediaRef as (() => React.RefObject<HTMLVideoElement>)}
            />
        )
    }
    // is image
    else if (mime.isImage(props.info.name)) {
        return (
            <ImageController
                info={props.info}
                mediaRef={props.mediaRef as (() => React.RefObject<HTMLImageElement>)}
                setBackground={props.setBackground}
            />
        )
    }

    // else
    return ( <UnsupportedFormatController info={props.info} /> );
}

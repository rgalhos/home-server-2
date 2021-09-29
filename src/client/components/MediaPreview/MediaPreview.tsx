import React from "react";
import axios from "axios";

import * as mime from "../../utils/mimeTypes";
import { Box, CircularProgress, Container } from "@mui/material";
import { withRouter } from "react-router-dom";
import MediaPreviewInfo, { IMediaPreviewInfo } from "./MediaPreviewInfo/MediaPreviewInfo";
import MediaPreviewControllers from "./MediaPreviewControllers/MediaPreviewControllers";

import "./MediaPreview.css";

interface MediaPreviewStates {
    fileInfo: IMediaPreviewInfo | null,
    error: string,
    mediaDimensions: { width: number, height: number },
    background: string,
};

export class MediaPreview extends React.Component<any, MediaPreviewStates> {
    mediaRef: React.RefObject<any>;

    constructor(props: any) {
        super(props);

        document.title = "Media preview";

        this.state = {
            fileInfo: null,
            error: "",
            mediaDimensions: { width: -1, height: -1 },
            background: "#000",
        };

        this.setMediaDimensions = this.setMediaDimensions.bind(this);
        this.setBackground = this.setBackground.bind(this);
        this.mediaRef = React.createRef();
    }

    setBackground(background: string) {
        this.setState({ background });
    }

    setMediaDimensions({ width, height }: { width: number, height: number }) {
        this.setState({ mediaDimensions: { width, height } });
    }

    componentDidMount() {
        axios({
            method: "GET",
            url: "/api/getFileInfo",
            params: {
                hash: this.props.match.params.hash,
            },
        }).then(({ data }) => {
            document.title = "Preview of " + data.name;
            
            this.setState({
                fileInfo: data,
            });
        }).catch((error) => {
            this.setState({
                error: error.message || "Unknown Error",
            });
        });
    }

    render() {
        if (this.state.error) {
            return ( <h2> {this.state.error} </h2> )
        } else if (!this.state.fileInfo) {
            return (
                <div style={{ position: "absolute", top: "calc(50% - 50px)", left: "calc(50% - 50px)" }}>
                    <CircularProgress size={100} />
                </div>
            );
        }

        const info: IMediaPreviewInfo = this.state.fileInfo;

        if (this.state.mediaDimensions.width > 0 && this.state.mediaDimensions.height > 0) {
            info.width = this.state.mediaDimensions.width;
            info.height = this.state.mediaDimensions.height;
        }

        const srcLink = "/~/" + info.path;
        let media = ( <h2 style={{ textAlign: "center" }}>Format not supported</h2> );

        if (mime.isImage(info.name)) {
            media = (
                <Box id="image-box" style={{ background: this.state.background }}>
                        <img
                            src={srcLink}
                            alt={info.name}
                            data-hash={info.hash}
                            data-lastmodified={info.lastModified}
                            data-accesstime={info.accessTime}
                            data-created={info.created}
                            onLoad={({ target }: { target: any}) => this.setMediaDimensions({ width: target.naturalWidth, height: target.naturalHeight })}
                            ref={this.mediaRef}
                        />
                </Box>
            );
        } else if (mime.isVideo(info.name)) {
            media = (
                <Box id="image-box">
                    <video controls id="video-playback" ref={this.mediaRef} onLoadedMetadata={({ target }: { target: any}) => this.setMediaDimensions({ width: target.videoWidth, height: target.videoHeight })}>
                        <source src={srcLink} type="video/mp4" />
                    </video>
                </Box>
            );
        }

        return (
            <Container id="preview-image">
                {media}
    
                <MediaPreviewControllers
                    info={this.state.fileInfo}
                    mediaRef={() => this.mediaRef}
                    setBackground={this.setBackground}
                />
                
                <MediaPreviewInfo info={info} />
            </Container>
        );
    }
}

export default withRouter(MediaPreview);

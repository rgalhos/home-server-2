import React from "react";
import axios from "axios";

import * as mime from "../../utils/mimeTypes";
import { Box, CircularProgress, Container } from "@material-ui/core";
import { withRouter } from "react-router-dom";
import MediaPreviewInfo, { IMediaPreviewInfo } from "./MediaPreviewInfo/MediaPreviewInfo";
import MediaPreviewControllers from "./MediaPreviewControllers/MediaPreviewControllers";

import "./MediaPreview.css";

interface MediaPreviewStates {
    fileInfo: IMediaPreviewInfo | null,
    error: string,
    imageDimensions: { width: number, height: number },
    background: string,
};

export class MediaPreview extends React.Component<any, MediaPreviewStates> {
    videoRef: React.RefObject<any>;

    constructor(props: any) {
        super(props);

        document.title = "Media preview";

        this.state = {
            fileInfo: null,
            error: "",
            imageDimensions: { width: -1, height: -1 },
            background: "#000",
        };

        this.setImageDimensions = this.setImageDimensions.bind(this);
        this.setBackground = this.setBackground.bind(this);
        this.videoRef = React.createRef();
    }

    setBackground(background: string) {
        this.setState({ background });
    }

    setImageDimensions(img: any) {
        this.setState({
            imageDimensions: {
                width: img.target.naturalWidth,
                height: img.target.naturalHeight,
            },
        });
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
                <div style={{ textAlign: "center" }}>
                    <CircularProgress size={100} />
                </div>
            );
        }

        const info: IMediaPreviewInfo = this.state.fileInfo;

        if (this.state.imageDimensions.width > 0 && this.state.imageDimensions.height > 0) {
            info.width = this.state.imageDimensions.width;
            info.height = this.state.imageDimensions.height;
        }

        const srcLink = "/~" + info.path;
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
                        onLoad={this.setImageDimensions}
                        ref={this.videoRef}
                    />
                </Box>
            );
        } else if (mime.isVideo(info.name)) {
            media = (
                <Box id="image-box">
                    <video controls id="video-playback" ref={this.videoRef}>
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
                    mediaRef={() => this.videoRef}
                    setBackground={this.setBackground}
                />
                
                <MediaPreviewInfo info={info} />
            </Container>
        );
    }
}

export default withRouter(MediaPreview);

import React from "react";
import axios from "axios";

import { withStyles, Theme, createStyles } from '@material-ui/core/styles';
import { Box, Button, ButtonGroup, CircularProgress, Container } from "@material-ui/core";
import { withRouter } from "react-router-dom";
import MediaPreviewInfo, { IMediaPreviewInfo } from "../MediaPreviewInfo/MediaPreviewInfo";

import "./MediaPreview.css";

const StyledButtonGroup = withStyles((theme: Theme) =>
    createStyles({
        root: {
            display: "flex",
            flexGrow: 1,
            marginTop: "24px",
            marginBottom: "24px",
            border: "1px solid",
            borderColor: theme.palette.primary.main,
        },
    }),
)(ButtonGroup);

interface MediaPreviewStates {
    fileInfo: IMediaPreviewInfo | null,
    error: string,
    imageDimensions: { width: number, height: number },
    background: string,
};

export class MediaPreview extends React.Component<any, MediaPreviewStates> {
    videoRef: React.RefObject<any>;
    setPlaybackRate: (rate: number) => void;

    constructor(props: any) {
        super(props);

        document.title = "Media preview";

        this.state = {
            fileInfo: null,
            error: "",
            imageDimensions: { width: -1, height: -1 },
            background: "#000",
        };

        this.getImageDimensions = this.getImageDimensions.bind(this);
        this.setBackground = this.setBackground.bind(this);

        this.videoRef = React.createRef();
        this.setPlaybackRate = function(rate) {
            this.videoRef.current.playbackRate = rate;
        }
    }

    setBackground(background: string) {
        this.setState({ background });
    }

    getImageDimensions(img: any) {
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
            console.log(error)
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

        console.table(info);

        if (this.state.imageDimensions.width > 0 && this.state.imageDimensions.height > 0) {
            info.width = this.state.imageDimensions.width;
            info.height = this.state.imageDimensions.height;
        }

        const srcLink = "/~" + info.path;
        let media = ( <h2 style={{ textAlign: "center" }}>Format not supported</h2> );
        let mediaControls = ( <></> );

        if (imageMimeTypes.indexOf(info.mimeType as string) !== -1) {
            media = (
                <Box id="image-box" style={{ background: this.state.background }}>
                    <img
                        src={srcLink}
                        alt={info.name}
                        data-hash={info.hash}
                        data-lastmodified={info.lastModified}
                        data-accesstime={info.accessTime}
                        data-created={info.created}
                        onLoad={this.getImageDimensions}
                    />
                </Box>
            );

            mediaControls = (
                <Box id="media-controls">
                    <StyledButtonGroup variant="text" color="primary" aria-label="text primary button group" id="bg-buttons-group">
                        <Button style={{ background: "#000" }} onClick={() => this.setBackground("#000")}>&nbsp;</Button>
                        <Button style={{ background: "#fff" }} onClick={() => this.setBackground("#fff")}>&nbsp;</Button>
                        <Button style={{ background: "url('/transp.png') repeat" }} onClick={() => this.setBackground("url('/transp.png') repeat")}>&nbsp;</Button>
                    </StyledButtonGroup>
                </Box>
            );
        } else if (videoMimeTypes.indexOf(info.mimeType as string) !== -1) {
            media = (
                <Box id="image-box">
                    <video controls id="video-playback" ref={this.videoRef}>
                        <source src={srcLink} type="video/mp4" />
                    </video>
                </Box>
            );

            mediaControls = (
                <Box>
                    <StyledButtonGroup variant="text" color="primary" aria-label="text primary button group" id="bg-buttons-group">
                        <Button variant="outlined" onClick={() => this.setPlaybackRate(1)}>1x</Button>
                        <Button variant="outlined" onClick={() => this.setPlaybackRate(1.25)}>1.25x</Button>
                        <Button variant="outlined" onClick={() => this.setPlaybackRate(1.5)}>1.5x</Button>
                        <Button variant="outlined" onClick={() => this.setPlaybackRate(1.75)}>1.75x</Button>
                        <Button variant="outlined" onClick={() => this.setPlaybackRate(2)}>2x</Button>
                    </StyledButtonGroup>
                </Box>
            );
        }

        return (
            <Container id="preview-image">
                {media}
    
                {mediaControls}
                
                <MediaPreviewInfo info={info} />
            </Container>
        );
    }
}

export default withRouter(MediaPreview);

const imageMimeTypes = [
    "image/jpeg",
    "image/png",
    "image/webp",
    "image/avif",
    "image/tiff",
    "image/gif",
    "image/svg+xml",
    "image/bmp"
];

const videoMimeTypes = [
    "video/mp4",
    "video/x-matroska",
    "video/webm",
    "video/quicktime",
    "video/x-msvideo"
];

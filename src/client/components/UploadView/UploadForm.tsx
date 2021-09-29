import { Alert, AlertTitle, Box, Button, Container, FormControl, LinearProgress } from "@mui/material";
import UploadFileListPreview from "./UploadFileListPreview";
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import FolderOpenIcon from '@mui/icons-material/FolderOpen';
import React from "react";
import axios from "axios";

interface UploadFormProps {
    path: string,
};

interface UploadFormStates {
    files: FileList | null,
    enableUploadButton: boolean,
    isUploading: boolean,
    uploadProgress: number,
    uploadCompleted: boolean,
    error: boolean,
    errorMessage: string,
    success: boolean,
};

export default class UploadForm extends React.Component<UploadFormProps, UploadFormStates> {
    constructor(props: any) {
        super(props);

        this.state = {
            files: null,
            enableUploadButton: false,
            isUploading: false,
            uploadProgress: 0,
            uploadCompleted: false,
            error: false,
            errorMessage: "",
            success: false,
        };

        this.changeHandler = this.changeHandler.bind(this);
        this.handleUpload = this.handleUpload.bind(this);
        this.onUploadProgress = this.onUploadProgress.bind(this);
    }

    changeHandler(event: React.ChangeEvent<HTMLInputElement>) {
        this.setState({
            files: event.target.files,
            enableUploadButton: !!event.target.files && event.target.files?.length > 0,
        });
    }

    handleUpload() {
        if (!this.state.files || this.state.files?.length === 0) {
            return;
        }

        const formData = new FormData();

        Array.from(this.state.files).forEach(file => {
            formData.append("fileToUpload[]", file);
        });

        const self = this;

        this.setState({
            isUploading: true,
        }, () => {
            axios({
                url: "/api/uploadFiles?filesPath=" + encodeURIComponent(this.props.path),
                method: "POST",
                headers: {
                    "Content-Type": "multipart/form-data",
                },
                data: formData,
                onUploadProgress: self.onUploadProgress,
            }).then(() => {
                this.setState({
                    isUploading: false,
                    uploadCompleted: true,
                    success: true,
                });
            }).catch(error => {
                console.error(error);
                
                this.setState({
                    isUploading: false,
                    uploadCompleted: true,
                    success: false,
                    error: true,
                    errorMessage: error?.message || "Unknown error",
                });
            });
        });
    }

    onUploadProgress({ loaded, total }: { loaded: number, total: number }) {
        this.setState({
            uploadProgress: Math.round((100 * loaded) / total),
        });
    }

    render() {
        let uploadFeedback = ( <></> );
        let uploadDimScreen = ( <></> );

        if (this.state.uploadCompleted) {
            if (this.state.success) {
                uploadFeedback = (
                    <Alert severity="success" action={
                        <Button
                            variant="outlined"
                            size="small"
                            component={"a"}
                            color="inherit"
                            href={ '/#' + this.props.path }
                        >
                            View in directory
                        </Button>
                    }>
                        Files uploaded successfully
                    </Alert>
                )
            } else if (this.state.error) {
                uploadFeedback = (
                    <Alert severity="error" action={
                        <Button
                            variant="outlined"
                            size="small"
                            color="inherit"
                            onClick={this.handleUpload}
                        >
                            Try again
                        </Button>
                    }>
                        <AlertTitle>Error</AlertTitle>
                        {this.state.errorMessage}
                    </Alert>
                );
            }
        } else if (this.state.isUploading) {
            uploadDimScreen = (
                <>
                    <Box style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", backgroundColor: "rgba(0, 0, 0, .66)", zIndex: 9998 }}></Box>
                    <Container style={{ position: "absolute", marginTop: "45vh", zIndex: 9999 }}>
                        <LinearProgress variant="determinate" color="primary" value={this.state.uploadProgress} style={{ zIndex: 9999 }} />
                    </Container>
                </>
            )
        }

        return (
            <Box>
                {uploadDimScreen}

                {uploadFeedback}

                <FormControl>
                    <Button
                        id="upload-input"
                        component="label"
                        color="secondary"
                        variant="outlined"
                        disabled={this.state.isUploading}
                        startIcon={ <FolderOpenIcon /> }
                    >
                        Select Files
                        <input
                            type="file"
                            name="files"
                            multiple={true}
                            hidden={true}
                            onChange={this.changeHandler}
                        />
                    </Button>

                    <br />

                    <Button
                        color="primary"
                        variant="contained"
                        onClick={this.handleUpload}
                        disabled={!this.state.enableUploadButton || this.state.isUploading}
                        startIcon={ <CloudUploadIcon /> }
                    >
                        Upload
                    </Button>

                    <UploadFileListPreview
                        files={this.state.files}
                    />
                </FormControl>
            </Box>
        );
    }
}

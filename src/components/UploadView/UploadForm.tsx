import { Box, Button, CircularProgress, FormControl } from "@material-ui/core";
import { Alert, AlertTitle } from "@material-ui/lab";
import UploadFileListPreview from "./UploadFileListPreview";
import CloudUploadIcon from '@material-ui/icons/CloudUpload';
import FolderOpenIcon from '@material-ui/icons/FolderOpen';
import React from "react";

interface UploadFormProps {
    path: string,
};

interface UploadFormStates {
    files: FileList | null,
    enableUploadButton: boolean,
    isUploading: boolean,
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
            uploadCompleted: false,
            error: false,
            errorMessage: "",
            success: false,
        };

        this.changeHandler = this.changeHandler.bind(this);
        this.handleUpload = this.handleUpload.bind(this);
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

        const url = "/api/uploadFiles?filesPath=" + encodeURIComponent(this.props.path);

        this.setState({
            isUploading: true,
        }, () => {
            fetch(url, {
                method: "POST",
                body: formData,
            })
            .then((response) => response.json())
            .then((response) => {
                if (response.error) {
                    this.setState({
                        isUploading: false,
                        uploadCompleted: true,
                        success: false,
                        error: true,
                        errorMessage: response.error.message || "Unknown error",
                    });
                } else {
                    this.setState({
                        isUploading: false,
                        uploadCompleted: true,
                        success: true,
                    });
                }
            })
            .catch((err) => {
                console.dir(err);
            });
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
                        {this.state.errorMessage}
                    </Alert>
                );
            }
        } else if (this.state.isUploading) {
            uploadDimScreen = (
                <>
                    <Box style={{ position: "absolute", top: "0", left: "0", width: "100%", height: "100%", backgroundColor: "rgba(0, 0, 0, .66)", zIndex: 9998 }}></Box>
                    <Box style={{ position: "absolute", top: "calc(50% - 50px)", left: "calc(50% - 50px)", zIndex: 9999 }}>
                        <CircularProgress size={100} />
                    </Box>
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
                        disabled={!this.state.enableUploadButton && this.state.isUploading}
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

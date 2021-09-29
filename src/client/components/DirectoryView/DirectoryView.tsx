import React from "react";
import axios from "axios";

import { CircularProgress, Container, Snackbar } from "@material-ui/core";
import FolderList from "./FolderList/FolderList";
import FileList from "./FileList/FileList";
import ImageList from "./ImageList/ImageList";
import VideoList from "./VideoList/VideoList";
import IFileInfo from "../../../common/interfaces/IFileInfo";
import IFolderOverview from "../../../common/interfaces/IFolderOverview";
import SwipeableDrawerDirectory from "./SwipeableDrawerDirectory";
import { Alert } from "@material-ui/lab";

interface States {
    path: string,
    fileList: null | IFileInfo[],
    folderList: null | IFolderOverview[],
    imageList: null | IFileInfo[],
    videoList: null | IFileInfo[],
    error: boolean,
    errorMessage: string,
    infoSnackbar: string,
};

class DirectoryView extends React.Component<{}, States> {
    constructor(props: any) {
        super(props);

        this.state = {
            // Retrieve last location
            path: window.location.hash.substr(1) || '/',
            fileList: null,
            folderList: null,
            imageList: null,
            videoList: null,
            error: false,
            errorMessage: "",
            infoSnackbar: "",
        };

        this.changeDirectory = this.changeDirectory.bind(this);
        this.updateFolderList = this.updateFolderList.bind(this);
        this.updateFileList = this.updateFileList.bind(this);
        this.generateThumbsForDirectory = this.generateThumbsForDirectory.bind(this);
        this.scanFiles = this.scanFiles.bind(this);

        window.onpopstate = (event) => {
            event.preventDefault();
            this.changeDirectory(window.location.hash.substr(1) || '/');
        }
    }

    componentDidMount() {
        this.changeDirectory(this.state.path);
    }

    changeDirectory(path: string) {
        path = path.replace(/\\+|\/+/g, '/');
        path = path || '/';

        document.title = "Contents of " + path;

        this.setState({
            path,
            fileList: null,
            folderList: null,
            imageList: null,
            videoList: null,
        }, () => {
            this.scanFiles(() => {
                this.updateFolderList(() => {
                    this.generateThumbsForDirectory(() => {
                        this.updateFileList();
                    });
                });
            });
        });
    }

    scanFiles(cb: () => void = function noop() { }) {
        axios({
            url: "/api/scanFiles",
            method: "GET",
            params: {
                path: this.state.path,
            },
        })
        .then(cb)
        .catch((error) => {
            console.error(error);

            this.setState({
                error: true,
                errorMessage: error,
            });
        });
    }

    updateFolderList(cb: () => void = function noop() { }) {
        axios({
            url: "/api/getFolders",
            method: "GET",
            params: {
                path: this.state.path,
            },
        }).then(({ data }) => {
            this.setState({
                folderList: data,
            }, cb);
        }).catch((error) => {
            this.setState({
                error: true,
                errorMessage: error.message,
            });
        });
    }

    updateFileList(cb: () => void = function noop() { }) {
        axios({
            url: "/api/getFiles",
            method: "GET",
            params: {
                path: this.state.path,
            },
        }).then(({ data }) => {
            console.dir(data);
            this.setState({
                fileList: data.filter((file: any) => file.type === "file" || file.thumbnail === null),
                imageList: data.filter((file: any) => file.type === "image" && !!file.thumbnail),
                videoList: data.filter((file: any) => file.type === "video" && !!file.thumbnail).slice(0, 50),
            }, cb);
        }).catch((error) => {
            console.error(error);
            
            this.setState({
                error: true,
                errorMessage: error.message,
            });
        });
    }

    generateThumbsForDirectory(cb: () => void = function noop() { }) {
        axios({
            url: "/api/generateThumbsForDirectory",
            method: "GET",
            params: {
                path: this.state.path,
            },
        })
        .then(({ data }) => {
            if (!data.error && data.message) {
                this.setState({
                    infoSnackbar: data.message,
                });
            }

            cb();
        })
        .catch((error) => {
            console.error(error);
            
            this.setState({
                error: true,
                errorMessage: error.message,
            });
        });
    }

    render() {
        let contents;
        
        if (this.state.fileList === null || this.state.folderList === null || this.state.imageList === null || this.state.videoList === null) {
            contents = (
                <div style={{ position: "absolute", top: "calc(50% - 50px)", left: "calc(50% - 50px)" }}>
                    <CircularProgress size={100} />
                </div>
            );
        } else {
            let snackbar = ( <></> );

            if (this.state.infoSnackbar) {
                snackbar = (
                    <Snackbar anchorOrigin={{ vertical: "top", horizontal: "center" }} open={true}>
                        <Alert severity="warning">
                            {this.state.infoSnackbar}
                        </Alert>
                    </Snackbar>  
                );
            }

            contents = (
                <>
                    {snackbar}

                    <FolderList
                        path={this.state.path}
                        folderList={this.state.folderList}
                        changeDirectory={this.changeDirectory}
                    />

                    <ImageList
                        path={this.state.path}
                        imageList={this.state.imageList}
                    />

                    <VideoList
                        path={this.state.path}
                        videoList={this.state.videoList}
                    />

                    <FileList
                        files={this.state.fileList}
                    />
                </>
            );
        }

        return (
            <>
                <SwipeableDrawerDirectory
                    path={this.state.path}
                />
                
                <Container id="directory-view">
                    {contents}
                </Container>
            </>
        );
    }
}

export default DirectoryView;

import React from "react";
import axios from "axios";

import { CircularProgress, Container } from "@material-ui/core";
import FolderList from "./FolderList/FolderList";
import FileList from "./FileList/FileList";
import ImageList from "./ImageList/ImageList";
import VideoList from "./VideoList/VideoList";
import IFileInfo from "../../../common/interfaces/IFileInfo";
import IFolderOverview from "../../../common/interfaces/IFolderOverview";
import SwipeableDrawerDirectory from "./SwipeableDrawerDirectory";
import { getSettings } from "../../utils/utils";
import { isVideo } from "../../utils/mimeTypes";

interface States {
    path: string,
    fileList: null | IFileInfo[],
    folderList: null | IFolderOverview[],
    imageList: null | IFileInfo[],
    videoList: null | IFileInfo[],
    error: boolean,
    errorMessage: string,
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
        };

        this.changeDirectory = this.changeDirectory.bind(this);
        this.updateFolderList = this.updateFolderList.bind(this);
        this.updateFileList = this.updateFileList.bind(this);
        this.updateImageList = this.updateImageList.bind(this);
        this.generateThumbsForDirectory = this.generateThumbsForDirectory.bind(this);
        this.filterVideoPreviews = this.filterVideoPreviews.bind(this);
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

        const self = this;

        document.title = "Contents of " + path;

        this.setState({
            path,
            fileList: null,
            folderList: null,
            imageList: null,
            videoList: null,
        }, () => {
            self.scanFiles(() => {
                self.updateFolderList(() => {
                    self.updateFileList(() => {
                        self.generateThumbsForDirectory(() => {
                            self.updateImageList(() => {
                                getSettings().then(({ data }) => {
                                    if (data.videoThumbnails) {
                                        self.filterVideoPreviews();
                                    }
                                });
                            });
                        });
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

            cb();
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
            }, cb);
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
            this.setState({
                fileList: data,
            }, cb);
        }).catch((error) => {
            console.error(error);
            
            this.setState({
                error: true,
                errorMessage: error.message,
            }, cb);
        });
    }

    updateImageList(cb: () => void = function noop() { }) {
        axios({
            url: "/api/getImages",
            method: "GET",
            params: {
                path: this.state.path,
            },
        }).then(({ data }) => {
            this.setState({
                imageList: data,
            }, cb);
        }).catch((error) => {
            console.error(error);

            this.setState({
                error: true,
                errorMessage: error.message,
            }, cb);
        });
    }

    generateThumbsForDirectory(cb: () => void = function noop() { }) {
        axios({
            url: "/api/generateThumbsForDirectory",
            method: "GET",
            params: {
                path: this.state.path,
            },
        }).then(() => {
            cb();
        }).catch((error) => {
            console.error(error);

            cb()
        });
    }

    filterVideoPreviews() {
        this.setState({
            videoList: (this.state.fileList || []).filter(({ name }) => isVideo(name)),
            fileList: (this.state.fileList || []).filter(({ name }) => !isVideo(name)),
        }, () => console.dir(this.state));
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
            contents = (
                <>
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
            <Container id="directory-view">
                <SwipeableDrawerDirectory
                    path={this.state.path}
                />
                
                {contents}
            </Container>
        );
    }
}

export default DirectoryView;

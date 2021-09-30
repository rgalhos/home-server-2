import React from "react";
import axios from "axios";

import { Alert, CircularProgress, Container } from "@mui/material";
import FolderList from "./FolderList/FolderList";
import FileList from "./FileList/FileList";
import ImageList from "./ImageList/ImageList";
import VideoList from "./VideoList/VideoList";
import IFileInfo from "../../../common/interfaces/IFileInfo";
import IFolderOverview from "../../../common/interfaces/IFolderOverview";
import ISearchFilters from "../../../common/interfaces/ISearchFilters";
import SwipeableDrawerDirectory from "./SwipeableDrawerDirectory";
import { getFilesSorting, getImageSorting, getVideoSorting } from "../../utils/session";

interface States {
    path: string,
    rawFileList: null | IFileInfo[],
    fileList: null | IFileInfo[],
    folderList: null | IFolderOverview[],
    imageList: null | IFileInfo[],
    videoList: null | IFileInfo[],
    error: boolean,
    errorMessage: string,
    infoAlert: string,
};

class DirectoryView extends React.Component<{}, States> {
    constructor(props: any) {
        super(props);

        this.state = {
            // Retrieve last location
            path: window.location.hash.substr(1) || '/',
            rawFileList: null,
            fileList: null,
            folderList: null,
            imageList: null,
            videoList: null,
            error: false,
            errorMessage: "",
            infoAlert: "",
        };

        this.changeDirectory = this.changeDirectory.bind(this);
        this.updateFolderList = this.updateFolderList.bind(this);
        this.updateFileList = this.updateFileList.bind(this);
        this.generateThumbsForDirectory = this.generateThumbsForDirectory.bind(this);
        this.scanFiles = this.scanFiles.bind(this);
        this.onSearchSubmit = this.onSearchSubmit.bind(this);

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

    onSearchSubmit(query: string) {
        this.updateFileList(() => { }, {
            string: query
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

    updateFileList(cb: () => void = function noop() { }, filters: ISearchFilters = {}) {
        filters.sort = {
            file: getFilesSorting(),
            image: getImageSorting(),
            video: getVideoSorting(),
        };

        axios({
            url: "/api/getFiles",
            method: "GET",
            params: {
                path: this.state.path,
                filters: JSON.stringify(filters),
            },
        }).then(({ data }) => {
            this.setState({
                error: false,
                errorMessage: "",
                rawFileList: data,
                fileList: data.files,
                imageList: data.images,
                videoList: data.videos,
            }, cb);
        }).catch((error) => {
            this.setState({
                error: true,
                errorMessage: error?.response?.data?.message || error.message,
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
            this.setState({
                infoAlert: (!data?.error) ? (data?.message || null) : null,
            }, cb);
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
            contents = (
                <>
                    {this.state.infoAlert && (
                        <Alert severity="warning">
                            {this.state.infoAlert}
                        </Alert>
                    )}

                    {(this.state.error && this.state.errorMessage) && (
                        <Alert severity="error">
                            {this.state.errorMessage}
                        </Alert>
                    )}

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
                    onSearchSubmit={this.onSearchSubmit}
                />
                
                <Container id="directory-view">
                    {contents}
                </Container>
            </>
        );
    }
}

export default DirectoryView;

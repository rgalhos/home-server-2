import React from "react";
import axios from "axios";

import { CircularProgress, Container } from "@material-ui/core";
import FolderList from "./FolderList/FolderList";
import FileList from "./FileList/FileList";
import IFileInfo from "../../../interfaces/IFileInfo";
import IFolderOverview from "../../../interfaces/IFolderOverview";
import ImageList from "./ImageList/ImageList";
import SwipeableDrawerDirectory from "./SwipeableDrawerDirectory";

interface States {
    path: string,
    fileList: null | IFileInfo[],
    folderList: null | IFolderOverview[],
    imageList: null | IFileInfo[],
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
            error: false,
            errorMessage: "",
        };

        this.changeDirectory = this.changeDirectory.bind(this);
        this.updateFolderList = this.updateFolderList.bind(this);
        this.updateFileList = this.updateFileList.bind(this);
        this.updateImageList = this.updateImageList.bind(this);
        this.generateThumbsForDirectory = this.generateThumbsForDirectory.bind(this);
        this.scanFiles = this.scanFiles.bind(this);

        const self = this;
        window.onpopstate = function(event) {
            event.preventDefault();
            self.changeDirectory(window.location.hash.substr(1) || '/');
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
        }, () => {
            self.scanFiles(() => {
                self.updateFolderList(() => {
                    self.updateFileList(() => {
                        self.generateThumbsForDirectory(() => {
                            self.updateImageList();
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
    
    render() {
        let contents;
        if (this.state.fileList === null || this.state.folderList === null || this.state.imageList === null) {
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

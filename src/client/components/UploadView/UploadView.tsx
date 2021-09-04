import React from "react";
import axios from "axios";
import { Container, CircularProgress, Button } from "@material-ui/core";
import { Alert, AlertTitle } from "@material-ui/lab";
import HistoryIcon from '@material-ui/icons/History';
import NavigationBreadcrumb from "../DirectoryView/NavigationBreadcrumb/NavigationBreadcrumb";
import UploadForm from "./UploadForm";

interface UploadViewStates {
    loaded: boolean,
    directoryExists: boolean,
    error: boolean,
    errorMessage: string,
    path: string,
};

export default class UploadView extends React.Component<any, UploadViewStates> {
    constructor(props: any) {
        super(props);

        const path = window.location.hash.substr(1).replace(/\/+|\\+/g, '/');

        document.title = "Upload to " + path;

        this.state = {
            loaded: false,
            directoryExists: true,
            error: false,
            errorMessage: "",
            path: path,
        };

        this.changeDirectory = this.changeDirectory.bind(this);

        window.onpopstate = (event) => {
            event.preventDefault();
            this.changeDirectory(window.location.hash.substr(1) || '/');
        }
    }

    changeDirectory(_path: string) {
        window.location.reload();
    }

    componentDidMount() {
        axios({
            method: "GET",
            url: "/api/directoryExists",
            params: {
                path: this.state.path,
            }
        }).then(({ data }) => {
            this.setState({
                loaded: true,
                directoryExists: data.exists,
            });
        }).catch(e => {
            this.setState({
                loaded: true,
                error: true,
                errorMessage: e.message || "Unknown error",
            });
        });
    }

    render() {
        if (!this.state.loaded) {
            return (
                <div style={{ position: "absolute", top: "calc(50% - 50px)", left: "calc(50% - 50px)" }}>
                    <CircularProgress size={100} />
                </div>
            );
        } else if (this.state.error) {
            return (
                <Container>
                    <Alert severity="error">
                        <AlertTitle>Error</AlertTitle>
                        {this.state.errorMessage}
                    </Alert>
                </Container>
            );
        }
        
        const breadcrumbs = (
            <NavigationBreadcrumb
                path={this.state.path}
                changeDirectory={this.changeDirectory}
            />
        );

        if (!this.state.directoryExists) {
            return (
                <Container style={{ paddingTop: "24px"}}>
                    <Alert severity="warning" variant="outlined">
                        The given directory does not exist
                        {breadcrumbs}

                        <br />

                        <Button
                            variant="outlined"
                            startIcon={ <HistoryIcon /> }
                            onClick={ () => window.history.back() }
                        >
                            Go back
                        </Button>
                    </Alert>
                </Container>
            );
        }

        return (
            <Container id="upload-view">
                {breadcrumbs}

                <UploadForm path={this.state.path} />
            </Container>
        );
    }
}

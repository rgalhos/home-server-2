import { Container, CircularProgress, Button, Breadcrumbs } from "@material-ui/core";
import { Alert, AlertTitle } from "@material-ui/lab";
import HistoryIcon from '@material-ui/icons/History';
import React from "react";
import axios from "axios";
import UploadForm from "./UploadForm";

interface UploadViewStates {
    loaded: boolean,
    directoryExists: boolean,
    error: boolean,
    errorMessage: string,
};

const breadcrumbStyle: React.CSSProperties = {
    margin: "15px 5px 5px 25px",
    fontSize: "1rem",
    fontWeight: 400,
    lineHeight: "1.5",
    letterSpacing: "0.00938em",
    fontFamily: "\"Roboto\", \"Helvetica\", \"Arial\", sans-serif",
};

export default class UploadView extends React.Component<any, UploadViewStates> {
    public readonly path: string;

    constructor(props: any) {
        super(props);

        this.path = window.location.hash.substr(1).replace(/\/+|\\+/g, '/');

        document.title = "Upload to " + this.path;

        this.state = {
            loaded: false,
            directoryExists: true,
            error: false,
            errorMessage: "",
        };
    }

    componentDidMount() {
        axios({
            method: "GET",
            url: "/api/directoryExists",
            params: {
                path: this.path,
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
            <Breadcrumbs style={breadcrumbStyle}>
                <span>root</span>
                { this.path.split('/').slice(1).map((dir, i) => ( <span key={i}>{dir}</span> )) }
            </Breadcrumbs>
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

                <UploadForm path={this.path} />
            </Container>
        );
    }
}

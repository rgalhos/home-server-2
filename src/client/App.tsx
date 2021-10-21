import React from "react";
import { BrowserRouter, Switch, Route } from "react-router-dom";
import { ThemeProvider } from "@mui/material/styles";
import { CircularProgress } from "@mui/material";
import CssBaseline from "@mui/material/CssBaseline";
import lightTheme from "./themes/lightTheme";
import darkTheme from "./themes/darkTheme";
import { getUserTheme } from "./utils/session";

const DirectoryView = React.lazy(() => import("./components/DirectoryView/DirectoryView"));
const TrashbinView = React.lazy(() => import("./components/TrashbinView/TrashbinView"));
const MediaPreview = React.lazy(() => import("./components/MediaPreview/MediaPreview"));
const UploadView = React.lazy(() => import("./components/UploadView/UploadView"));

const theme = {
    dark: darkTheme,
    light: lightTheme,
}[getUserTheme()] || darkTheme;

class App extends React.Component {
    render() {
        return (
            <ThemeProvider theme={theme}>
                <CssBaseline />

                <BrowserRouter>
                    <React.Suspense fallback={
                        <div style={{ position: "absolute", top: "calc(50% - 50px)", left: "calc(50% - 50px)" }}>
                            <CircularProgress size={100} color="primary" />
                        </div>
                    }>
                        <Switch>
                            <Route path="/$preview/:hash" component={MediaPreview} />
                            <Route path="/$upload/" component={UploadView} />
                            <Route path="/$bin/" component={TrashbinView} />
                            <Route path="/" component={DirectoryView} />
                        </Switch>
                    </React.Suspense>
                </BrowserRouter>
            </ThemeProvider>
        );
    }
}

export default App;

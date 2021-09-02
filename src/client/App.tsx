import React from "react";
import { BrowserRouter, Switch, Route } from "react-router-dom";
import { ThemeProvider } from "@material-ui/core/styles";
import CssBaseline from "@material-ui/core/CssBaseline";
import lightTheme from "./themes/lightTheme";
import darkTheme from "./themes/darkTheme";
import DirectoryView from "./components/DirectoryView/DirectoryView";
import MediaPreview from "./components/MediaPreview/MediaPreview";
import { getUserTheme } from "./utils/session";
import UploadView from "./components/UploadView/UploadView";
import { TrashbinView } from "./components/TrashbinView/TrashbinView";

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
                    <Switch>
                        <Route path="/$preview/:hash" component={MediaPreview} />
                        <Route path="/$upload/" component={UploadView} />
                        <Route path="/$bin/" component={TrashbinView} />
                        <Route path="/">
                            <DirectoryView />
                        </Route>
                    </Switch>
                </BrowserRouter>
            </ThemeProvider>
        );
    }
}

export default App;

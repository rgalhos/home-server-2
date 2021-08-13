import React from "react";
import { BrowserRouter, Switch, Route } from "react-router-dom";
import { ThemeProvider } from "@material-ui/core/styles";
import CssBaseline from "@material-ui/core/CssBaseline";
import { darkTheme } from "./themes/darkTheme";
import DirectoryView from "./components/DirectoryView/DirectoryView";
import MediaPreview from "./components/MediaPreview/MediaPreview";

class App extends React.Component {
    render() {
        return (
            <ThemeProvider theme={darkTheme}>
                <CssBaseline />

                <BrowserRouter>
                    <Switch>
                        <Route path="/$preview/:hash" component={MediaPreview} />
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

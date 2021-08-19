import React from "react";
import ReactDOM from "react-dom";
import * as session from "./session";
import App from "./App";
import "./index.css";

(function() {
    Promise.resolve(true)
        .then(session.check)
        .then(render)
    ;

    function render() {
        ReactDOM.render(
            <React.StrictMode>
                <App />
            </React.StrictMode>,
            document.getElementById('root')
        );
    }
})();


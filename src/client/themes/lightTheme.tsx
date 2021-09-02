import { createTheme } from "@material-ui/core/styles";

const lightTheme = createTheme({
    palette: {
        type: "light",
        primary: {
            main: "#f45d22", // "rgb(244, 93, 34)",
        },
        background: {
            //default: "rgb(21, 32, 43)",
            //default: "rgb(0, 0, 0, .88)",
            default: "#ffffff",
        }
    }
});

export default lightTheme;

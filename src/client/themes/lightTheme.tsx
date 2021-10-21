import { createTheme } from "@mui/material/styles";
import overrides from "./overrides";

const lightTheme = createTheme({
    palette: {
        mode: "light",
        primary: {
            main: "#f45d22", // "rgb(244, 93, 34)",
        },
        background: {
            // default: "rgb(21, 32, 43)",
            // default: "rgb(0, 0, 0, .88)",
            default: "#ffffff",
        }
    },
    ...overrides
});

export default lightTheme;

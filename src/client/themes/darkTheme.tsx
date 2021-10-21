import { createTheme } from "@mui/material/styles";
import overrides from "./overrides";

const darkTheme = createTheme({
    palette: {
        mode: "dark",
        primary: {
            "600": "#5725b4",
            main: "#794BC4", // "rgb(121, 75, 196)",
            "300": "#916bce",
            "200": "#b196dc",
            "100": "#d0c0e9",
        },
        background: {
            // default: "rgb(21, 32, 43)",
            // default: "rgb(0, 0, 0, .88)",
            default: "#121212",
        }
    },
    ...overrides,
});

export default darkTheme;

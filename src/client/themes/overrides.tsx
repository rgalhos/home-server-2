import { ThemeOptions } from "@mui/material/styles/createTheme"

export default {
    components: {
        components: {
            MuiImageListItemBar: {
                styleOverrides: {
                    root: {
                        titleWrap: {
                            whiteSpace: "break-spaces",
                        },
                    }
                }
            }
        }
    }
} as ThemeOptions;

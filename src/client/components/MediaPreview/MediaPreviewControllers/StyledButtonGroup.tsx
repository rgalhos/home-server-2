import { withStyles, createStyles } from "@mui/styles";
import { ButtonGroup, Theme } from "@mui/material";

const StyledButtonGroup = withStyles((theme: Theme) =>
    createStyles({
        root: {
            display: "flex",
            flexGrow: 1,
            marginTop: "24px",
            marginBottom: "24px",
            border: "1px solid",
            borderColor: theme.palette.primary.main,
        },
    }),
)(ButtonGroup);

export default StyledButtonGroup;

import { withStyles, createStyles } from "@material-ui/styles";
import { ButtonGroup } from "@mui/material";

const StyledButtonGroup = withStyles((theme: any) =>
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

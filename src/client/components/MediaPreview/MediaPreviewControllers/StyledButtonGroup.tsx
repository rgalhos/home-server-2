import { withStyles, Theme, createStyles } from '@material-ui/core/styles';
import { ButtonGroup } from "@material-ui/core";

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

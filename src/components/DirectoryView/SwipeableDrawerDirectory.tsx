import React from "react";
import { List, ListItem, ListItemIcon, ListItemText, Switch, SwipeableDrawer, ListItemSecondaryAction, ListSubheader } from "@material-ui/core";
import DeleteIcon from '@material-ui/icons/Delete';
import NightsStayIcon from '@material-ui/icons/NightsStay';
import WbSunnyIcon from '@material-ui/icons/WbSunny';
import BackupIcon from '@material-ui/icons/Backup';
import { getUserTheme, setUserTheme } from "../../utils/session";

export default function SwipeableDrawerDirectory(props: any) {
    const [ isOpen, setOpen ] = React.useState(false);
    const [ isDarkMode, _toggleDarkMode ] = React.useState(getUserTheme() === "dark");

    function toggleDarkMode() {
        let darkModeNow = !isDarkMode;
        _toggleDarkMode(darkModeNow);
        let theme = darkModeNow ? "dark" : "light";
        console.log("Theme set to", theme);
        setUserTheme(theme);
        setTimeout(() => window.location.reload(), 100);
    }

    function onClose() {
        setOpen(false);
    }

    function onOpen() {
        setOpen(true);
    }

    const list = (
        <div role="presentation">
            <List>
                <ListItem button>
                    <ListItemIcon><DeleteIcon /></ListItemIcon>
                    <ListItemText>Bin</ListItemText>
                </ListItem>
                <ListItem button>
                    <ListItemIcon><BackupIcon /></ListItemIcon>
                    <ListItemText>Upload</ListItemText>
                </ListItem>
            </List>
            <List dense={true} subheader={<ListSubheader>Settings</ListSubheader>} style={{ width: "225px" }}>
                <ListItem color="primary">
                    <ListItemIcon><NightsStayIcon /></ListItemIcon>
                    <ListItemText primary="Night mode" />
                    <ListItemSecondaryAction>
                        <Switch
                            color="primary"
                            checked={isDarkMode}
                            icon={<WbSunnyIcon />}
                            checkedIcon={<NightsStayIcon />}
                            onChange={toggleDarkMode}
                            edge="end"
                            size="medium"
                        />
                    </ListItemSecondaryAction>
                </ListItem>
            </List>
        </div>
    );

    return (
        <SwipeableDrawer disableDiscovery={true} anchor="left" onClose={onClose} onOpen={onOpen} open={isOpen}>
            {list}
        </SwipeableDrawer>
    )
}


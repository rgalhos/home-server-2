import React from "react";
import { Divider, List, ListItem, ListItemIcon, ListItemText, Switch, SwipeableDrawer, ListItemSecondaryAction, ListSubheader, Link, AppBar, IconButton, Toolbar } from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import MenuIcon from "@mui/icons-material/Menu";
import NightsStayIcon from "@mui/icons-material/NightsStay";
import WbSunnyIcon from "@mui/icons-material/WbSunny";
import BackupIcon from "@mui/icons-material/Backup";
import SearchBar from "./SearchBar";
import { getUserTheme, setUserTheme } from "../../utils/session";

interface SwipeableDrawerDirectoryProps {
    path: string,
    onSearchSubmit: (query: string) => void,
};

export default function SwipeableDrawerDirectory(props: SwipeableDrawerDirectoryProps) {
    const [ isOpen, setOpen ] = React.useState(false);
    const [ isDarkMode, _toggleDarkMode ] = React.useState(getUserTheme() === "dark");

    // 1280 (max container width) + 225*2 (225 = drawer width) - 30 (padding)
    const drawerAlwaysVisible = window.innerWidth >= 1700;

    function toggleDarkMode() {
        let darkModeNow = !isDarkMode;
        _toggleDarkMode(darkModeNow);
        let theme = darkModeNow ? "dark" : "light";
        console.log("Theme set to", theme);
        setUserTheme(theme);
        setTimeout(() => window.location.reload(), 100);
    }

    function toggleDrawer() {
        setOpen(!isOpen);
    }

    function onClose() {
        setOpen(false);
    }

    function onOpen() {
        setOpen(true);
    }

    const searchBar = (
        <SearchBar onSubmit={props.onSearchSubmit} />
    );

    const list = (
        <div role="presentation">
            <List>
                { drawerAlwaysVisible && (
                    <>
                        {searchBar}
                        <ListItem></ListItem>
                        <Divider />
                    </>
                ) }

                <ListItem button component={Link} color="inherit" href="/$bin">
                    <ListItemIcon><DeleteIcon /></ListItemIcon>
                    <ListItemText>Bin</ListItemText>
                </ListItem>

                <ListItem button component={Link} color="inherit" href={"/$upload/#" + props.path}>
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
        <>
            {!drawerAlwaysVisible && (
                <AppBar position="sticky" color="inherit">
                    <Toolbar>
                        <IconButton color="inherit" onClick={toggleDrawer} edge="start">
                            <MenuIcon /> 
                        </IconButton>

                        {searchBar}
                    </Toolbar>
                </AppBar>
            )}
            
            <SwipeableDrawer
                disableDiscovery={true}
                anchor="left"
                onClose={onClose}
                onOpen={onOpen}
                open={isOpen}
                variant={drawerAlwaysVisible ? "permanent" : "temporary"}
            >
                {list}
            </SwipeableDrawer>
        </>
    )
}

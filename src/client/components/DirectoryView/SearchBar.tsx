import React from "react";
import { useHistory } from "react-router-dom";

import SearchIcon from "@mui/icons-material/Search";
import { InputBase } from "@mui/material";
import { alpha, styled } from "@mui/system";

const Search = styled("div")(({ theme }) => ({
    position: "relative",
    borderRadius: theme.shape.borderRadius,
    backgroundColor: alpha(theme.palette.common.white, 0.15),
    "&:hover": {
        backgroundColor: alpha(theme.palette.common.white, 0.25),
    },
    marginRight: theme.spacing(2),
    marginLeft: 0,
    width: "100%",
    [theme.breakpoints.up("sm")]: {
        marginLeft: theme.spacing(3),
        width: "auto",
    },
}));

const SearchIconWrapper = styled("div")(({ theme }) => ({
    padding: theme.spacing(0, 2),
    height: "100%",
    position: "absolute",
    pointerEvents: "none",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
}));
  
const StyledInputBase = styled(InputBase)(({ theme }) => ({
    color: "inherit",
    "& .MuiInputBase-input": {
        padding: theme.spacing(1, 1, 1, 0),
        // vertical padding + font size from searchIcon
        paddingLeft: `calc(1em + ${theme.spacing(4)})`,
        // @ts-ignore
        transition: theme.transitions.create("width"),
        width: "100%",
        [theme.breakpoints.up("md")]: {
            width: "20ch",
        },
    },
}));

function SearchBar({ onSubmit }: { onSubmit: (query: string) => void }) {
    const hist = useHistory();
    const ref = React.useRef();

    let restoredSearch = (hist.location.state as { [k: string]: any })?.searchQuery;

    const [ value, onChange ] = React.useState(restoredSearch || "");

    // https://developer.mozilla.org/en-US/docs/Web/API/HTMLInputElement/search_event
    React.useEffect(() => {
        // @ts-ignore
        ref?.current && (ref.current.onsearch = (e) => {
            onSubmit(e.target.value);
            hist.push('/' + window.location.hash, {
                ...(hist.location.state as { [k: string]: any } || {}),
                searchQuery: e.target.value
            });
        });
        // eslint-disable-next-line
    }, []);
    
    return (
        <Search style={{ marginLeft: "12px" }}>
            <SearchIconWrapper>
                <SearchIcon />
            </SearchIconWrapper>
            <StyledInputBase
                placeholder="Search in folder"
                type="search"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                inputProps={{ "aria-label": "search" }}
                ref={ref}
            />
        </Search>
    );
}

export default SearchBar;

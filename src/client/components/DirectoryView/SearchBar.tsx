import React from "react";

import SearchIcon from "@mui/icons-material/Search";
import { InputBase } from "@mui/material";
import { alpha, styled } from "@mui/system";

export const Search = styled("div")(({ theme }) => ({
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

export const SearchIconWrapper = styled("div")(({ theme }) => ({
    padding: theme.spacing(0, 2),
    height: "100%",
    position: "absolute",
    pointerEvents: "none",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
}));
  
export const StyledInputBase = styled(InputBase)(({ theme }) => ({
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

export default function SearchBar({ onSubmit }: { onSubmit: (query: string) => void }) {
    const [ value, onChange ] = React.useState("");
    const ref = React.useRef<HTMLInputElement>();

    function onKeyDown(event: React.KeyboardEvent) {
        if (ref?.current && event.key === "Enter") {
            onSubmit(value);
        }
    }
    
    return (
        <Search style={{ marginLeft: "12px" }}>
            <SearchIconWrapper>
                <SearchIcon />
            </SearchIconWrapper>
            <StyledInputBase
                ref={ref}
                placeholder="Search in folder"
                inputProps={{ "aria-label": "search" }}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                onKeyDown={onKeyDown}
            />
        </Search>
    );
}

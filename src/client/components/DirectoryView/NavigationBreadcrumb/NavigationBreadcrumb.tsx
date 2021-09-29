import React from "react";
import { Breadcrumbs, Typography, Link } from '@mui/material';

interface NavigationBreadcrumbProps {
    changeDirectory?: (dir: string) => void,
    path: string,
}

export default function NavigationBreadcrumb(props: NavigationBreadcrumbProps) {
    const changeDirectory = props.changeDirectory || ((noop: string) => void 0);
    const dirs = props.path.replace(/\/|\\/g, '/').split('/').filter(x => !!x).map((item, i, arr) => (
        { item, path: '/' + arr.slice(0, i + 1).join('/') }
    ));

    const style: React.CSSProperties = {
        margin: "15px 5px 5px 25px",
        fontSize: "1rem",
        fontWeight: 400,
        lineHeight: "1.5",
        letterSpacing: "0.00938em",
        fontFamily: "\"Roboto\", \"Helvetica\", \"Arial\", sans-serif",
    };

    return (
        <Breadcrumbs maxItems={3} aria-label="breadcrumbs" style={style}>
            <Link color="inherit" href="#/" onClick={() => changeDirectory("/")}>
                root
            </Link>
            {
                dirs.slice(0, -1).map(({ item, path }) => (
                    <Link color="inherit" href={'#' + path} onClick={() => changeDirectory(path)} key={path}>
                        {item}
                    </Link>
                ))
            }
            {
                dirs.length >= 1
                ? (
                    <Typography color="textPrimary">{dirs.pop()?.item}</Typography> 
                )
                : ( <span></span> )
            }
        </Breadcrumbs>
    )
}

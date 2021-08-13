import React from "react";

import { Box, ImageList as ImageListBox, ImageListItem, Link } from '@material-ui/core';
import IFileInfo from "../../../interfaces/IFileInfo";

interface ImageListProps {
    path: string,
    imageList: IFileInfo[],
};

export default class ImageList extends React.Component<ImageListProps, {}> {
    constructor(props: ImageListProps) {
        super(props);

        console.dir(props.imageList)
    }

    render() {
        let thumbs = this.props.imageList
        .map((image) => (
            <ImageListItem key={image.hash} data-hash={image.hash}>
                <Link href={"/$preview/" + image.hash}>
                    <img
                        src={'/' + image.thumbnail as string}
                        alt={image.name}
                        loading="lazy"
                        width={100}
                        height={100}
                    />
                </Link>
            </ImageListItem>
        ));

        return (
            <Box id="image-list">
                <ImageListBox rowHeight={100} cols={4} style={{ margin: "0px" }}>
                    {thumbs}
                </ImageListBox>
            </Box>
        );
    }
}

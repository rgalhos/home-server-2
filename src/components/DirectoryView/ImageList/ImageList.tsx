import React from "react";
import { getImageSorting } from "../../../utils/session";
import { Box, ImageList as ImageListBox, ImageListItem, Link } from '@material-ui/core';
import IFileInfo from "../../../../interfaces/IFileInfo";

interface ImageListProps {
    path: string,
    imageList: IFileInfo[],
};

export default class ImageList extends React.Component<ImageListProps, {}> {
    imageList: ImageListProps["imageList"];

    constructor(props: ImageListProps) {
        super(props);

        this.imageList = this.props.imageList;

        let sorting = getImageSorting();
        
        if (sorting !== "name") {
            let sortingFn: (a: IFileInfo, b: IFileInfo) => number = (a, b) => 0;

            if (sorting === "created_asc") {
                sortingFn = (a, b) => a.created - b.created;
            } else if (sorting === "created_desc") {
                sortingFn = (a, b) => b.created - a.created;
            }

            this.imageList = this.imageList.sort(sortingFn);
        }
    }

    render() {
        let thumbs = this.imageList
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

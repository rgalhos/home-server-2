import React from "react";
import { getImageSorting } from "../../../utils/session";
import { Box, ImageList as ImageListBox, ImageListItem, Link } from '@mui/material';
import IFileInfo from "../../../../common/interfaces/IFileInfo";

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
            } else if (sorting === "modified_asc") {
                sortingFn = (a, b) => a.lastModified - b.lastModified;
            } else if (sorting === "modified_desc") {
                sortingFn = (a, b) => b.lastModified - a.lastModified;
            }

            this.imageList = this.imageList.sort(sortingFn);
        }
    }

    render() {
        if (this.imageList.length === 0) {
            return ( <></> );
        }

        let thumbs = this.imageList
        .map((image) => (
            <ImageListItem
                key={image.hash}
                data-hash={image.hash}
                component={Link}
                href={"/$preview/" + image.hash}
            >
                <img
                    src={'/~thumbs/' + image.thumbnail as string}
                    alt={image.name}
                    loading="lazy"
                    width={100}
                    height={100}
                />
            </ImageListItem>
        ));

        // Número de colunas depende do tamanho da tela
        // Trunc(Max(vw, 1280) / 100)
        // No mínimo 4 imagens por linha
        const noCols = Math.max(4, Math.trunc(Math.min(window.innerWidth, 1280) / 100));

        return (
            <Box id="image-list" style={{ marginBottom: "5%" }}>
                <ImageListBox rowHeight={100} cols={noCols} style={{ margin: "0px" }}>
                    {thumbs}
                </ImageListBox>
            </Box>
        );
    }
}

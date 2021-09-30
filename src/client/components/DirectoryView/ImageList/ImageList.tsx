import React from "react";
import { Box, ImageList as ImageListBox, ImageListItem, Link } from '@mui/material';
import IFileInfo from "../../../../common/interfaces/IFileInfo";

interface ImageListProps {
    path: string,
    imageList: IFileInfo[],
};

export default class ImageList extends React.Component<ImageListProps> {
    render() {
        if (this.props.imageList.length === 0) {
            return ( <></> );
        }

        let thumbs = this.props.imageList
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

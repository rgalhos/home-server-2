import React from "react";
import { Box, ImageList as ImageListBox, ImageListItem, ImageListItemBar, Link } from '@material-ui/core';
import IFileInfo from "../../../../common/interfaces/IFileInfo";
import { isOnMobile } from "../../../utils/utils";

interface VideoListProps {
    path: string,
    videoList: IFileInfo[],
};

export default class VideoList extends React.Component<VideoListProps, {}> {
    videoList: VideoListProps["videoList"];

    constructor(props: VideoListProps) {
        super(props);

        this.videoList = this.props.videoList.sort((a, b) =>
            a.name.toLowerCase().localeCompare(b.name.toLowerCase())
        );
    }

    render() {
        if (this.videoList.length === 0) {
            return ( <></> );
        }

        let thumbs = this.videoList.map((video) => (
            <VideoItem
                video={video}
                key={video.hash}
            />
        ));

        return (
            <Box id="video-list">
                <ImageListBox rowHeight={50} cols={4} style={{ justifyContent: "space-between", margin: "0 2px" }}>
                    {thumbs}
                </ImageListBox>
            </Box>
        );
    }
}

const VideoItem = ({ video }: { video: IFileInfo} ) => {
    const ref: React.Ref<HTMLVideoElement> = React.useRef<HTMLVideoElement>(null);

    let size = isOnMobile() ? '50%' : '25%';

    const style = {
        width: `calc(${size} - 4px)`,
        height: `calc(${size} - 4px)`
    };

    return (
        <ImageListItem
            data-hash={video.hash}
            style={style}
            onTouchStart={ () => { ref?.current?.play() } }
            onTouchEnd={ () => { if (ref.current) { ref.current.pause(); ref.current.currentTime = 0; } } }
            onMouseOver={ () => { ref?.current?.play() } }
            onMouseOut={ () => { if (ref.current) { ref.current.pause(); ref.current.currentTime = 0; } } }
        >
            <Link href={"/$preview/" + video.hash}>
                <video
                    loop
                    muted
                    ref={ref}
                    width="100%"
                    height="100%"
                >
                    <source
                        src={"/~thumbs/" + video.hash + ".mp4"}
                        type="video/mp4"
                    />
                </video>

                <ImageListItemBar
                    title={ video.name.split('.').slice(0, -1).join('.') }
                />
            </Link>
        </ImageListItem>
    );
}

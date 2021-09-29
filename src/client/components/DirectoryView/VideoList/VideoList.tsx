import React from "react";
import { Box, ImageList as ImageListBox, ImageListItem, ImageListItemBar, Link } from '@material-ui/core';
import IFileInfo from "../../../../common/interfaces/IFileInfo";
import { isOnMobile } from "../../../utils/utils";
import { Pagination } from "@material-ui/lab";

interface VideoListProps {
    path: string,
    videoList: IFileInfo[],
};

interface VideoListStates {
    page: number,
}

const VIDEOS_PER_PAGE = 48; // Multiple of 4

export default class VideoList extends React.Component<VideoListProps, VideoListStates> {
    videoList: VideoListProps["videoList"];
    maxPages: number;

    constructor(props: VideoListProps) {
        super(props);

        this.state = {
            page: 1,
        };

        this.videoList = this.props.videoList.sort((a, b) =>
            a.name.toLowerCase().localeCompare(b.name.toLowerCase())
        );

        this.maxPages = Math.ceil(this.videoList.length / VIDEOS_PER_PAGE);

        this.changePage = this.changePage.bind(this);
    }

    changePage(_changeEvent: any, page: number) {
        page = Math.max(0, page);
        page = Math.min(page, this.maxPages);

        this.setState({ page });
    }

    render() {
        if (this.videoList.length === 0) {
            return ( <></> );
        }

        let thumbs = this.videoList.slice((this.state.page - 1) * VIDEOS_PER_PAGE, this.state.page * VIDEOS_PER_PAGE).map((video) => (
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

                <Box style={{ display: "flex", justifyContent: "center" }}>
                    <Pagination count={this.maxPages} page={this.state.page} color="primary" size="large" onChange={this.changePage} showFirstButton showLastButton />
                </Box>
            </Box>
        );
    }
}

function playVideo({ current: video }: { current: HTMLVideoElement | null }) {
    video?.play();
}

function stopVideo({ current: video }: { current: HTMLVideoElement | null }) {
    if (video) {
        video.pause();
        video.currentTime = 0;
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
            onTouchStart={() => playVideo(ref) }
            onTouchEnd={ () => stopVideo(ref) }
            onMouseOver={ () => playVideo(ref) }
            onMouseOut={ () => stopVideo(ref) }
        >
            <Link href={"/$preview/" + video.hash}>
                <video
                    loop
                    muted
                    ref={ref}
                    width="100%"
                    height="100%"
                    preload="none"
                    poster={"/~thumbs/" + video.hash + "_poster.jpg"}
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

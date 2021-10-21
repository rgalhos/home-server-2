import React from "react";
import { Box, Pagination, ImageList as ImageListBox, ImageListItem, ImageListItemBar, Link } from "@mui/material";
import IFileInfo from "../../../../common/interfaces/IFileInfo";
import { isOnMobile } from "../../../utils/utils";
import { useHistory } from "react-router";

interface VideoListProps {
    path: string,
    videoList: IFileInfo[],
};

const VIDEOS_PER_PAGE = 48; // Multiple of 4

export default function VideoList(props: VideoListProps) {
    const hist = useHistory();
    const [ currentPage, setCurrentPage ] = React.useState((hist.location.state as { [k: string]: any })?.page || 1);

    // Retorna para a página 1 se o usuário procurar algum arquivo
    React.useEffect(() => {
        setCurrentPage((hist.location.state as { [k: string]: any })?.page || 1);
        // eslint-disable-next-line
    }, [ props.videoList ]);

    const maxPages = Math.ceil(props.videoList.length / VIDEOS_PER_PAGE);

    function changePage(_changeEvent: any, page: number) {
        page = Math.max(0, page);
        page = Math.min(page, maxPages);

        hist.push('/' + window.location.hash, {
            ...(hist.location.state as { [k: string]: any } || {}),
            page: page,
        });

        setCurrentPage(page);
    }

    if (props.videoList.length === 0) {
        return ( <></> );
    }

    let thumbs = props.videoList
        .slice((currentPage - 1) * VIDEOS_PER_PAGE, currentPage * VIDEOS_PER_PAGE)
        .map((video) => (
            <VideoItem
                video={video}
                key={video.hash}
            />
        )
    );

    return (
        <Box id="video-list">
            <ImageListBox cols={isOnMobile() ? 2 : 4} style={{ justifyContent: "space-between", margin: "0 2px" }}>
                {thumbs}
            </ImageListBox>

            {maxPages > 1 && (
                <Box style={{ display: "flex", justifyContent: "center", marginTop: "12px" }}>
                    <Pagination count={maxPages} page={currentPage} color="primary" size="large" onChange={changePage} showFirstButton showLastButton />
                </Box>
            )}
        </Box>
    );
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

    return (
        <ImageListItem
            data-hash={video.hash}
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

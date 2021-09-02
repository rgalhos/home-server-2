import React from "react";
import { Box, BottomNavigation, BottomNavigationAction } from "@material-ui/core";
import { IMediaPreviewInfo } from "../../MediaPreviewInfo/MediaPreviewInfo";
import GetAppIcon from '@material-ui/icons/GetApp';
import DeleteForeverIcon from '@material-ui/icons/DeleteForever';
import CameraEnhanceIcon from "@material-ui/icons/CameraEnhance";
import FastForwardIcon from '@material-ui/icons/FastForward';
import AccessTimeIcon from '@material-ui/icons/AccessTime';
import { newMediaSession } from "../../../../utils/videoMediaControl";

interface IVideoControllerProps {
    info: IMediaPreviewInfo,
    mediaRef: () => React.RefObject<HTMLVideoElement>,
}


export default function VideoController(props: IVideoControllerProps) {
    const [playbackRate, _setPlaybackRate] = React.useState(1);

    React.useEffect(() => {
        (props.mediaRef().current as HTMLVideoElement).addEventListener("play", () => {
            newMediaSession(props.mediaRef(), props.info, takeVideoSnapshot);
        }, {once: true});
    });

    function setPlaybackRate(rate: number) {
        _setPlaybackRate(rate);

        if (props.mediaRef()?.current) {
            (props.mediaRef().current as HTMLVideoElement).playbackRate = rate;
        }
    }

    function takeVideoSnapshot(type: string, quality: number, size?: { width: number, height: number }) : Promise<string> {
        return new Promise((resolve, reject) => {
            const mediaRef = props.mediaRef().current as HTMLVideoElement;
            size = size || {
                width: mediaRef.videoWidth,
                height: mediaRef.videoHeight,
            };

            const canvas = document.createElement("canvas");
            canvas.id = "snapshot_" + Math.trunc(Math.random() * 1e6);
            canvas.width = mediaRef.videoWidth;
            canvas.height = mediaRef.videoHeight;
            document.body.appendChild(canvas);

            const context = canvas.getContext("2d");
            context?.drawImage(mediaRef, 0, 0, size.width, size.height);

            try {
                canvas.toBlob((blob) => {
                    canvas.remove();
                    
                    try {
                        resolve(window.URL.createObjectURL(blob));
                    } catch(e) {
                        reject(e);
                    }
                }, type, quality);
            } catch(e) {
                reject(e);
            }
        });
    }

    function saveVideoSnapshot() {
        const mediaRef = props.mediaRef().current as HTMLVideoElement;

        const currentVideoTime = {
            h: Math.trunc(mediaRef.currentTime / 3600),
            m: Math.trunc((mediaRef.currentTime / 60) % 60),
            s: Math.trunc(mediaRef.currentTime % 60),
            ms: Math.trunc((mediaRef.currentTime % 1) * 1000),
        };

        function formatTime(h: number, m: number, s: number, ms: number, sep = ':', sepMs = '.') {
            var H = h === 0 ? '00' : (h >= 10 ? h : '0' + h),
                M = m === 0 ? '00' : (m >= 10 ? m : '0' + m),
                S = s === 0 ? '00' : (s >= 10 ? s : '0' + s),
                MS = ms === 0 ? '000' : (ms >= 10 ? (ms >= 100 ? ms : '0' + ms) : '00' + ms)
            ;

            return [H, M, S].join(sep) + sepMs + MS;
        }

        const canvas = document.createElement("canvas");
        canvas.id = "snapshot_" + formatTime(currentVideoTime.h, currentVideoTime.m, currentVideoTime.s, currentVideoTime.ms, '.', '.');
        canvas.width = mediaRef.videoWidth;
        canvas.height = mediaRef.videoHeight;
        document.body.appendChild(canvas);

        const context = canvas.getContext("2d");
        context?.drawImage(mediaRef, 0, 0, mediaRef.videoWidth, mediaRef.videoHeight);

        takeVideoSnapshot("image/png", 1.0).then((data) => {
            const downloadLink = document.createElement("a");
            downloadLink.href = data;
            downloadLink.download = props.info.name.split('.').slice(0, -1).join('.').replace(/[/\\?%*:|"<>]/g, '-') + "_" + canvas.id + ".png";
            downloadLink.dispatchEvent(new MouseEvent("click", { bubbles: true, cancelable: true, view: window, }));

            setTimeout(() => {
                // For Firefox it is necessary to delay revoking the ObjectURL
                window.URL.revokeObjectURL(data);
                downloadLink.remove();
                canvas.remove();
            }, 100);
        });
    }

    function downloadVideo() {
        const downloadLink = document.createElement("a");
        downloadLink.href = "/~/" + props.info.path;
        downloadLink.download = props.info.name;
        downloadLink.dispatchEvent(new MouseEvent("click", { bubbles: true, cancelable: true, view: window, }));
        downloadLink.remove();
    }

    function handleAction(action: string) {
        if (action === "download") {
            downloadVideo();
        } else if (action === "snapshot") {
            saveVideoSnapshot();
        }
    }

    return (
        <Box className="media-controls margin-5">
            <BottomNavigation showLabels={true} value={playbackRate} onChange={(e, rate) => setPlaybackRate(rate)} style={{ overflow: "hidden" }}>
                <BottomNavigationAction label="1x" value={1} icon={<AccessTimeIcon />} />
                <BottomNavigationAction label="1.25x" value={1.25} icon={<FastForwardIcon />} />
                <BottomNavigationAction label="1.5x" value={1.5} icon={<FastForwardIcon />} />
                <BottomNavigationAction label="1.75x" value={1.75} icon={<FastForwardIcon />} />
                <BottomNavigationAction label="2x" value={2} icon={<FastForwardIcon />} />
            </BottomNavigation>

            <BottomNavigation onChange={(e, action) => handleAction(action)}>
                <BottomNavigationAction label="Download" value="download" icon={<GetAppIcon />} />
                <BottomNavigationAction label="Snapshot" value="snapshot" icon={<CameraEnhanceIcon />} />
                <BottomNavigationAction label="Delete" value="delete" icon={<DeleteForeverIcon />} />
            </BottomNavigation>
        </Box>
    );
}

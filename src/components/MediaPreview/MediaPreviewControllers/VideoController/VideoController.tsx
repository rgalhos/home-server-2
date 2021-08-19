import { Box, Button } from "@material-ui/core";
import { IMediaPreviewInfo } from "../../MediaPreviewInfo/MediaPreviewInfo";
import StyledButtonGroup from "../StyledButtonGroup";

interface IVideoControllerProps {
    info: IMediaPreviewInfo,
    mediaRef: () => React.RefObject<HTMLVideoElement>,
}


export default function VideoController(props: IVideoControllerProps) {
    function setPlaybackRate(rate: number) {
        if (props.mediaRef()?.current) {
            (props.mediaRef().current as HTMLVideoElement).playbackRate = rate;
        }
    }

    function takeVideoSnapshot() {
        const mediaRef = props.mediaRef().current;

        const currentVideoTime = {
            // @ts-ignore
            h: Math.trunc(mediaRef.currentTime / 3600),
            // @ts-ignore
            m: Math.trunc((mediaRef.currentTime / 60) % 60),
            // @ts-ignore
            s: Math.trunc(mediaRef.currentTime % 60),
            // @ts-ignore
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
        // @ts-ignore
        canvas.width = mediaRef.videoWidth;
        // @ts-ignore
        canvas.height = mediaRef.videoHeight;
        document.body.appendChild(canvas);

        const context = canvas.getContext("2d");
        // @ts-ignore
        context?.drawImage(mediaRef, 0, 0, mediaRef.videoWidth, mediaRef.videoHeight);

        canvas.toBlob((blob) => {
            const data = window.URL.createObjectURL(blob);

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
        }, "image/png", 1.0);
    }

    return (
        <Box className="media-controls margin-5">
            <StyledButtonGroup variant="text" color="primary" aria-label="text primary button group" className="bg-buttons-group margin-5">
                <Button variant="outlined" onClick={() => setPlaybackRate(1)}>1x</Button>
                <Button variant="outlined" onClick={() => setPlaybackRate(1.25)}>1.25x</Button>
                <Button variant="outlined" onClick={() => setPlaybackRate(1.5)}>1.5x</Button>
                <Button variant="outlined" onClick={() => setPlaybackRate(1.75)}>1.75x</Button>
                <Button variant="outlined" onClick={() => setPlaybackRate(2)}>2x</Button>
            </StyledButtonGroup>

            <Button variant="outlined" color="primary" className="full-button margin-5" onClick={takeVideoSnapshot}>
                Snapshot
            </Button>
        </Box>
    );
}

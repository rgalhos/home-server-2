import React from "react";

const UPDATE_VIDEO_ARTWORK_INTERVAL = 1 * 60 * 1000;

export function newMediaSession(
    ref: React.RefObject<HTMLVideoElement>,
    info: any,
    takeVideoSnapshot: (type: string, quality: number, size?: { width: number, height: number }) => Promise<string>
) {
    const mediaRef = ref.current as HTMLVideoElement;

    // @ts-ignore
    if (navigator?.mediaSession) {
        let artwork: undefined | { src: string, sizes: string, type: string }[];

        function takeSnapshotAndApplyMetadata() {
            takeVideoSnapshot("image/jpeg", 0.25).then((data) => {
                artwork = [{ src: data, sizes: "192x192", type: "image/jpeg" }];
            }).catch((e) => {
                console.error(e);
            }).finally(() => {
                // @ts-ignore
                navigator.mediaSession.metadata = new MediaMetadata({
                    title: info.name,
                    artwork: artwork
                });
            });
        }

        takeSnapshotAndApplyMetadata();

        setInterval(takeSnapshotAndApplyMetadata, UPDATE_VIDEO_ARTWORK_INTERVAL);

        // @ts-ignore
        navigator.mediaSession.setActionHandler("play", mediaRef.play);
        // @ts-ignore
        navigator.mediaSession.setActionHandler("pause", mediaRef.pause);
        // @ts-ignore
        navigator.mediaSession.setActionHandler("seekto", (event) => {
            if (event.fastSeek && mediaRef.hasOwnProperty("fastseek")) {
                mediaRef.fastSeek(event.seekTime as number);
                return;
            }

            mediaRef.currentTime = event.seekTime as number;
        });
    }
}
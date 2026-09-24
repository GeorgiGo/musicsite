import { useEffect, useRef } from "react";
import { VolSVG } from "../svgIcons";

/**
 * return a button for volume, it indicates currentVolume & can mute audio
 * @param currentVolume the number in range `0~1` for volume
 * @param audioRef the `useRef()` hook passed to this for control
 */
export default function VolumeButton({ currentVolume, audioRef }) {
    const volSVGRef = useRef(null);
    useEffect(() => {
        const fpath = volSVGRef.current?.querySelectorAll('path')[1]
        const spath = volSVGRef.current?.querySelectorAll('path')[2]
        if (!audioRef.current?.muted && currentVolume > 0) {
            if (currentVolume > 0.667) {
                fpath.setAttribute('d', fpath.getAttribute('data-v2'));
                spath.setAttribute('d', spath.getAttribute('data-v2'));
            } else {
                if (currentVolume > 0.333) {
                    fpath.setAttribute('d', fpath.getAttribute('data-v1'));
                    spath.setAttribute('d', spath.getAttribute('data-v1'));
                } else {
                    fpath.setAttribute('d', fpath.getAttribute('data-v0'));
                    spath.setAttribute('d', spath.getAttribute('data-v0'));
                }
            }
        } else {
            fpath.setAttribute('d', fpath.getAttribute('data-vn'));
            spath.setAttribute('d', spath.getAttribute('data-vn'));
        }
    }, [currentVolume, audioRef.current?.muted])
    return (
        < button onClick={() => audioRef.current.muted = !audioRef.current.muted
        } className='hover:bg-surface0 h-fit m-auto p-2 pt-3 pb-3 active:scale-80 transition-all duration-200 rounded-full w-[2vw] mr-0 text-text' > <VolSVG ref={volSVGRef} /> </button >
    )
}

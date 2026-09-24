import { useEffect, useRef } from "react";
import { PlayPauseSVG } from "../svgIcons"
/**
 * return a button for `play/pause`
 * @param isPlaying the boolean value that indicates is playing
 * @param setPlay the function for control `play/pause`
 */
export default function PlayPauseButton({ isPlaying, setPlay }) {
    const PlayPauseSVGRef = useRef(null);
    useEffect(() => {
        const fpath = PlayPauseSVGRef.current?.querySelectorAll('path')[0]
        const spath = PlayPauseSVGRef.current?.querySelectorAll('path')[1]
        if (isPlaying) {
            fpath.setAttribute('d', fpath.getAttribute('data-pl'));
            spath.setAttribute('d', spath.getAttribute('data-pl'));
        } else {
            fpath.setAttribute('d', fpath.getAttribute('data-pa'));
            spath.setAttribute('d', spath.getAttribute('data-pa'));
        }
    }, [isPlaying]);

    return (
        <button
            onClick={() => { setPlay(p => !p) }}
            className='active:scale-80 transition-all duration-200 m-auto text-text hover:bg-surface0 rounded-full w-[2.5vw] h-[2.5vw] mb-[2vh] xl:mb-auto relative'>
            <PlayPauseSVG ref={PlayPauseSVGRef} />
        </button>
    )
}

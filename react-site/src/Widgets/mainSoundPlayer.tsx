import { useRef, useEffect, useState, useMemo, useCallback } from 'react'
import { useAudio } from '../entities/AudioContext';
interface ProgressBar {
    max: number;
    cur: number;
    setValue: (num: number) => void
    baseStyle: string;
    innerStyle: string;
    valuePreviewFunction: (num: number) => string
    additionalOnClick?: () => void
}
function ProgressBar({ max, cur, setValue, baseStyle, innerStyle, valuePreviewFunction, additionalOnClick = () => { } }: ProgressBar) {
    const [hoverX, setHoverX] = useState<number>(0);
    const [isMouseDown, setMouseDown] = useState<boolean>(false);
    const [rect, setRect] = useState<DOMRect | null>(null);

    const mainBarRef = useCallback((node: HTMLDivElement | null) => {
        if (node !== null && !rect) {
            const rect = node.getBoundingClientRect();
            setRect(rect);
        }
    }, [rect]);

    return (
        <div ref={mainBarRef} onMouseLeave={() => setMouseDown(false)} onMouseUp={() => setMouseDown(false)} onBlur={() => setMouseDown(false)} onMouseDown={() => setMouseDown(true)}
            onMouseMove={(e) => {
                setHoverX(e.clientX);
                if (isMouseDown) {
                    setValue((e.clientX - rect?.left) / rect?.width * max);
                    additionalOnClick()
                }
            }} onClick={(e) => { setValue((e.clientX - rect?.left) / rect?.width * max); additionalOnClick() }} className={"group " + baseStyle} >
            <div className={'relative transition-all duration-200 h-full ' + innerStyle} style={{ width: `${(cur / max * 100).toFixed(2)}%` }}></div>
            <h1 className='select-none -translate-x-1/2 -translate-y-2/3 group-hover:block hidden absolute text-text text-[large]' style={{ left: `${hoverX}px` }}>󰗧</h1>
            <h1 className='select-none -translate-x-1/2 translate-y-[-150%] group-hover:block hidden absolute text-text text-[medium] bg-mantle p-[2px]' style={{ left: `${hoverX}px` }}>{valuePreviewFunction((hoverX - rect?.left) / rect?.width * max)}</h1>
        </div >
    )
}

export default function MainPlayer() {
    const { setPlay, currentSong, audioRef, isPlaying } = useAudio()
    const [currentTime, setCurrentTime] = useState<number>(0);
    const [currentVolume, setCurrentVolume] = useState<number>(1);
    useEffect(() => { setPlay(true) }, [currentSong?.stream_url])

    const setTime = (time) => { audioRef.current.currentTime = time }
    const setVolume = (vol) => { audioRef.current.volume = vol }


    useEffect(() => {
        audioRef.current.addEventListener('timeupdate', () => { setCurrentTime(audioRef.current.currentTime); localStorage.setItem('time', audioRef.current.currentTime) })
        audioRef.current.addEventListener('volumechange', () => { setCurrentVolume(audioRef.current.volume); localStorage.setItem('volume', audioRef.current.volume) })
        setTime((localStorage.getItem('time') || 0))
        setVolume(localStorage.getItem('volume') || 1)
        setCurrentVolume(audioRef.current.volume);
        setCurrentTime(audioRef.current.currentTime);
    }, [])
    return (<div className='z-10 backdrop-blur-[8px] fixed bottom-0 flex bg-[#1818259f] w-full h-[8vh] content-center'>
        <img className='w-[5vw] mt-auto mb-auto m-[1vw]' src={currentSong?.cover_url == "" ? "null" : currentSong?.cover_ur} alt="" />
        <div className='w-[20vw] flex-col flex m-auto ml-0 mr-0'>
            <span className='text-text font-bold text-auto'>{currentSong?.title}</span>
            <span className='text-subtext0 text-[small]'>{currentSong?.artist}</span>
        </div>
        <div className='text-text m-auto text-center w-[10vw] flex justify-evenly'>
            <button className='w-[1.8vw] h-[1.8vw] m-auto text-[large] mr-0'>{false ? '' : ''} </button>
            <button onClick={() => {
                if (isPlaying) setPlay(false)
                else setPlay(true)
            }} className='transition-all duration-300 m-auto text-[xx-large] text-text hover:bg-surface0 rounded-full w-[2.5vw] h-[2.5vw] relative'>{!isPlaying ? '' : ''}</button>
            <button style={{ color: (audioRef.current?.loop ? 'var(--color-mauve)' : 'var(--color-subtext0)') }} className='transition-all duration-300 pr-[0.4rem] pt-[3px] box-border w-[1.8vw] h-[1.8vw] hover:bg-surface0 rounded-full m-auto text-[large] ml-0' onClick={() => { audioRef.current.loop = !audioRef.current.loop; localStorage.setItem('loop', audioRef.current.loop) }}></button>
        </div>
        <div className="w-[27vw] flex ">
            <button className='w-[2vw] ml-[4vw] text-text'>{Math.round(currentVolume * 100)}%</button>

            <ProgressBar valuePreviewFunction={(num) => {
                return `${Math.round(num * 100)}%`
            }} max={1} cur={currentVolume} setValue={setVolume} baseStyle={' w-[10vw] bg-surface0 h-[1vh] m-[2vw] ml-[1vw] mt-auto mb-auto'} innerStyle={'bg-mauve'} />
        </div>
        <ProgressBar additionalOnClick={() => { audioRef.current?.play() }} valuePreviewFunction={(num) => {
            return `${Math.floor(num / 60)}:${Math.round(num % 60).toString().padStart(2, '0')}`
        }} max={currentSong?.duration} cur={currentTime} setValue={setTime} baseStyle={'absolute bg-surface0 w-full h-[0.5vh] top-[-0.5vh] hover:h-[0.8vh] hover:top-[-0.65vh]'} innerStyle={'bg-blue'} />
    </div >
    )
}

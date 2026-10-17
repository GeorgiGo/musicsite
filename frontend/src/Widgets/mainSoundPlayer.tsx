import { useRef, useEffect, useState, useMemo, useCallback } from 'react'
import { useAudio } from '../entities/contexts/AudioContext';
import { RepeatSVG, ShuffleSVG } from '../shared/svgIcons';
import ProgressBar from '../shared/playerShared/progressBar';
import useLocalStorage, { useLSWithTimeout } from '../entities/hooks/useLocalStorage';
import VolumeButton from '../shared/playerShared/volumeButton';
import PlayPauseButton from '../shared/playerShared/playPauseButton';
import { handleKeyWithKeyMap } from '../entities/keyHandler';
import ButtonWithTitle from '../shared/buttonWithTitle';


export default function MainPlayer() {
    const { setPlay, currentSong, audioRef, setIsShuffled, isPlaying, queue, currentSongIdx, isShuffled, loop, setIsLoop } = useAudio()
    const [currentTime, setCurrentTime] = useLSWithTimeout('time', 7000, 0);
    const [currentVolume, setCurrentVolume] = useLocalStorage<number>('volume', 1);
    useEffect(() => { setPlay(true) }, [currentSong?.stream_url])

    const setTime = (time: number) => { audioRef.current.currentTime = Math.max(time, 0) }
    const setVolume = (vol: number) => { audioRef.current.volume = Math.max(Math.min(1, vol), 0) }

    useEffect(() => {
        const timeUpdateHandler = (e) => { setCurrentTime(audioRef.current?.currentTime); }
        const volumeChangeHandler = (e) => { setCurrentVolume(audioRef.current?.volume); }
        const keyMap = {
            "Space": (e: KeyboardEvent) => { e.preventDefault(); setPlay((p: boolean) => !p) },
            "Digit0": (e: KeyboardEvent) => setTime(0),
            "ArrowLeft": (e: KeyboardEvent) => setTime(audioRef.current?.currentTime - 5),
            "ArrowRight": (e: KeyboardEvent) => setTime(audioRef.current?.currentTime + 5),
            "ArrowUp": (e: KeyboardEvent) => { e.preventDefault(); setVolume(Math.min(audioRef.current?.volume + 0.05, 1)) },
            "ArrowDown": (e: KeyboardEvent) => { e.preventDefault(); setVolume(Math.max(audioRef.current?.volume - 0.05, 0)) },
            "KeyM": (e: KeyboardEvent) => { if (audioRef.current) audioRef.current.muted = !audioRef.current.muted },
            "KeyR": (e: KeyboardEvent) => { if (audioRef.current) { audioRef.current.loop = !audioRef.current.loop; localStorage.setItem('loop', audioRef.current.loop) } },
            "KeyS": (e: KeyboardEvent) => setIsShuffled((prev: boolean) => !prev)
        }
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.target.tagName == "INPUT") return;
            handleKeyWithKeyMap(e, keyMap)
        }
        setTime(currentTime)
        setVolume(currentVolume)
        document.addEventListener('keydown', handleKeyDown)
        audioRef.current?.addEventListener('timeupdate', timeUpdateHandler)
        audioRef.current?.addEventListener('volumechange', volumeChangeHandler)
        return () => {
            document.removeEventListener('keydown', handleKeyDown);
            audioRef.current?.removeEventListener('timeupdate', timeUpdateHandler)
            audioRef.current?.removeEventListener('volumechange', volumeChangeHandler)
        }
    }, [])

    return (
        <div className='z-10 backdrop-blur-[8px] fixed flex-1 bottom-0 flex bg-[#1818259f] w-full h-[10vh] content-center'>
            <img className='flex h-[8vh] w-[8vh] xl:h-[5vw] xl:w-[5vw]  m-[1vw] mt-auto mb-auto' src={currentSong?.cover_url == "" ? "null" : currentSong?.cover_url} alt="" />
            <div className='flex flex-1 xl:w-[30vw] flex-row m-auto ml-0 mr-0'>
                <div className='flex w-[60vw] xl:w-[20vw] flex-col'>
                    <span className='text-text font-bold text-auto xl:text-[x-large]'>{currentSong?.title}</span>
                    <span className='text-subtext0 text-[small] xl:text-xl'>{currentSong?.artist}</span>
                </div>
                {!audioRef.current?.loop ? <div className='hidden xl:flex w-[60vw] xl:w-[20vw] flex-col m-auto mr-0 ml-2'>
                    {isShuffled ? <span className='text-text font-bold text-[small]'>?</span> : <>
                        <span className='text-text font-bold text-[medium]'>{queue[(currentSongIdx + 1) % queue.length]?.title}</span>
                        <span className='text-subtext0 text-[x-small]'>{queue[(currentSongIdx + 1) % queue.length]?.artist}</span></>}
                </div> : null
                }
            </div >
            <div className='text-text m-auto text-center flex-0_1 xl:w-[10vw] flex justify-center'>
                <ButtonWithTitle title='Случайный порядок (S)' onClick={() => setIsShuffled((prev: boolean) => !prev)}
                    className='relative m-auto mr-0'
                    style={{ color: (isShuffled ? 'var(--color-mauve)' : 'var(--color-subtext0)') }}>
                    <ShuffleSVG />
                </ButtonWithTitle>
                <PlayPauseButton setPlay={setPlay} isPlaying={isPlaying} />
                <ButtonWithTitle onClick={() => setIsLoop((p: boolean) => !p)}
                    title='Повтор (R)'
                    className='relative m-auto ml-0'
                    style={{ color: (audioRef.current?.loop ? 'var(--color-mauve)' : 'var(--color-subtext0)') }}>
                    <RepeatSVG />
                </ButtonWithTitle>
            </div>
            <div className="flex-1 hidden xl:flex ">
                <VolumeButton currentVolume={currentVolume} audioRef={audioRef} />
                <ProgressBar valuePreviewFunction={(num) => {
                    return `${Math.round(num * 100)}%`
                }} max={1} cur={currentVolume} setValue={setVolume} baseStyle={' w-[10vw] bg-surface0 h-[1vh] m-[2vw] ml-0 mt-auto mb-auto'} innerStyle={'bg-mauve'} />
            </div>
            <div className="invisible w-[10vw]"> </div>
            <ProgressBar additionalOnClick={() => { audioRef.current?.play() }} valuePreviewFunction={(num) => {
                return `${Math.floor(num / 60)}:${Math.round(num % 60).toString().padStart(2, '0')}`
            }} max={currentSong?.duration} cur={currentTime} setValue={setTime} baseStyle={'absolute bg-surface0 w-full h-[1vh] xl:h-[0.5vh] top-[-1vh] xl:top-[-0.5vh] hover:h-[0.8vh] hover:top-[-0.65vh]'} innerStyle={'bg-blue'} />
        </div >
    )
}


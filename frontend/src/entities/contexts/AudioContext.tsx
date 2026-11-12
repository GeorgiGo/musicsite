import { createContext, useState, useContext, useRef, useEffect, useCallback } from "react";
import type { Song, Playlist } from "../dataInterfaces";
import useLocalStorage from "../hooks/useLocalStorage";
import { MusicAPI } from "../api";
import { useSettings } from "./SettingsContext";

export type stopPlayAfter = 'None' | 'AfterThis' | 'AfterSecondSong'
const AudioContext = createContext(null)
export function AudioProvider({ children }) {
    const [isPlaying, setIsPlaying] = useState<boolean>(false);
    const [isShuffled, setIsShuffled] = useLocalStorage<boolean>('isShuffled', false);
    const [stopPlayAfter, setStopPlayAfter] = useState<stopPlayAfter>('None');
    const [queue, setQueue] = useState<Song[]>([]);
    const [mainQueue, setMainQueue] = useState<Song[]>([]);
    const [currentSong, setCurrentSong] = useState<Song>(null);
    const [currentSongIdx, setCurrentSongIdx] = useState<number>(0);
    const [playlists, setPlaylists] = useState<Playlist[]>([]);
    const [loop, setIsLoop] = useLocalStorage<boolean>('isLoop', false);
    const audioRef = useRef<HTMLAudioElement>(null);
    const audioSourceRef = useRef<any>(null);
    const updatePlaylists = () => { MusicAPI.getAllPlaylists().then(d => setPlaylists(d)).catch(err => console.error(err)) }
    const [findIn, setFindIn] = useState<'YANDEX' | 'LOCAL'>('LOCAL');

    const nexTrack = () => {
        let nextSongIdx = 0;
        let q = []
        setCurrentSongIdx((csi: number) => {
            nextSongIdx = csi + 1;
            setQueue((prev: Song[]) => {
                if (nextSongIdx > prev.length) nextSongIdx = 0;
                q = prev
                return prev
            });
            return csi
        });
        setCurTrack(nextSongIdx, q)
    }
    const prevTrack = () => {
        let nextSongIdx = 0;
        let q = []
        setCurrentSongIdx((csi: number) => {
            nextSongIdx = csi - 1;
            setQueue((prev: Song[]) => {
                if (nextSongIdx < 0) nextSongIdx = prev.length - 1;
                q = prev
                return prev
            });
            return csi
        });
        setCurTrack(nextSongIdx, q)
    }
    const nextTrack = () => {
        if (stopPlayAfter == 'AfterThis') {
            setStopPlayAfter('None')
            setPlay(false)
            return
        } else if (stopPlayAfter == 'AfterSecondSong') { setStopPlayAfter('AfterThis') }
        if (!audioRef.current?.loop) {
            let nextSongIdx = 0;
            if (isShuffled) {
                nextSongIdx = Math.floor(Math.random() * queue.length)
                if (nextSongIdx == currentSongIdx) nextSongIdx = Math.floor(Math.random() * queue.length)
            }
            else
                nextSongIdx = (currentSongIdx + 1) % queue.length
            setCurTrack(nextSongIdx)
        }
    }
    const setCurTrack = async (idx: number, arr = null) => {
        if (arr !== null) setQueue(arr)
        setCurrentSongIdx(idx)
        setCurrentSong(arr !== null ? arr[idx] : queue[idx])
        if (arr !== null) localStorage.setItem('queue', JSON.stringify(arr))
        localStorage.setItem('idx', JSON.stringify(idx))
    }

    useEffect(() => { audioRef.current.loop = loop }, [loop]);
    const setPlay = (value: boolean | ((prev: boolean) => boolean)) => {
        setIsPlaying((currentIsPlaying) => {
            // Вычисляем следующее состояние: если пришла функция — вызываем её, если boolean — берем как есть
            const nextValue = typeof value === 'function' ? value(currentIsPlaying) : value;
            // Управляем аудио в зависимости от вычисленного нового значения
            if (nextValue) audioRef.current?.play();
            else audioRef.current?.pause();
            // Возвращаем новое состояние, чтобы обновить стейт
            return nextValue;
        });
    }
    useEffect(() => {
        setCurTrack(JSON.parse(localStorage.getItem('idx')), JSON.parse(localStorage.getItem('queue')))
        audioRef.current.loop = localStorage.getItem('isLoop') !== null ? JSON.parse(localStorage.getItem('isLoop')) : false
    }, [])
    const { showCoverOnBack } = useSettings()
    return (
        <AudioContext.Provider value={{ prevTrack, findIn, setFindIn, nexTrack, stopPlayAfter, setStopPlayAfter, setIsShuffled, setMainQueue, mainQueue, isShuffled, audioSourceRef, queue, isPlaying, currentSong, setCurTrack, setQueue, setPlay, audioRef, playlists, setPlaylists, updatePlaylists, currentSongIdx, loop, setIsLoop }}>
            {children}
            <audio crossOrigin="anonymous" onEnded={() => nextTrack()} ref={audioRef} src={`${import.meta.env.VITE_API_URL}${currentSong?.stream_url == 'yandex' ? `/yandex/stream/${currentSong?.video_id}/stream.mp3` : currentSong?.stream_url}`} />
            {showCoverOnBack ? <div className="fixed top-0 w-full h-full -z-9900 left-auto">
                <img src={currentSong?.cover_url} className="h-full m-auto" />
            </div> : <></>}
        </AudioContext.Provider>
    );
}

export function useAudio() { return useContext(AudioContext); }

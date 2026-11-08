import { createContext, useState, useContext, useRef, useEffect } from "react";
import type { Song, Playlist } from "../dataInterfaces";
import useLocalStorage from "../hooks/useLocalStorage";
import { MusicAPI } from "../api";

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
    return (
        <AudioContext.Provider value={{ stopPlayAfter, setStopPlayAfter, setIsShuffled, setMainQueue, mainQueue, isShuffled, audioSourceRef, queue, isPlaying, currentSong, setCurTrack, setQueue, setPlay, audioRef, playlists, setPlaylists, updatePlaylists, currentSongIdx, loop, setIsLoop }}>
            {children}
            <audio crossOrigin="anonymous" onEnded={() => nextTrack()} ref={audioRef} src={`${import.meta.env.VITE_API_URL}${currentSong?.stream_url}`} />
        </AudioContext.Provider>
    );
}

export function useAudio() { return useContext(AudioContext); }

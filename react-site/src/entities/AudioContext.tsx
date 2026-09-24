import { createContext, useState, useContext, useRef, useEffect } from "react";
import EditSong from "../Widgets/EditSongW";
import type { SongEditInformation, Song, Playlist } from "./dataInterfaces";
import useLocalStorage from "./useLocalStorage";
import { MusicAPI } from "./api";

const AudioContext = createContext(null)
export function AudioProvider({ children }) {
    const [isPlaying, setIsPlaying] = useState<boolean>(false);
    const [isShuffled, setIsShuffled] = useLocalStorage<boolean>('isShuffled', false);
    const [queue, setQueue] = useState<Song[]>([]);
    const [currentSong, setCurrentSong] = useState<Song>(null);
    const [currentSongIdx, setCurrentSongIdx] = useState<number>(0);
    const [playlists, setPlaylists] = useState<Playlist[]>([]);
    const audioRef = useRef<HTMLAudioElement>(null);
    const audioSourceRef = useRef<any>(null);
    const updatePlaylists = () => { MusicAPI.getAllPlaylists().then(d => setPlaylists(d)).catch(err => console.error(err)) }
    const nextTrack = () => {
        if (!audioRef.current?.loop) {
            let nextSongIdx = 0;
            if (isShuffled)
                nextSongIdx = Math.floor(Math.random() * queue.length)
            else
                nextSongIdx = (currentSongIdx + 1) % queue.length
            setCurrentSongIdx(nextSongIdx)
            setCurrentSong(queue[nextSongIdx])
            localStorage.setItem('idx', JSON.stringify(nextSongIdx))
        }

    }
    const setCurTrack = async (idx, arr = null) => {
        if (arr !== null) setQueue(arr)
        setCurrentSongIdx(idx)
        setCurrentSong(arr !== null ? arr[idx] : queue[idx])
        if (arr !== null) localStorage.setItem('queue', JSON.stringify(arr))
        localStorage.setItem('idx', idx)
    }
    const setPlay = (value: boolean | ((prev: boolean) => boolean)) => {
        setIsPlaying((currentIsPlaying) => {
            // Вычисляем следующее состояние: если пришла функция — вызываем её, если boolean — берем как есть
            const nextValue = typeof value === 'function' ? value(currentIsPlaying) : value;
            // Управляем аудио в зависимости от вычисленного нового значения
            if (nextValue)
                audioRef.current?.play();
            else
                audioRef.current?.pause();
            // Возвращаем новое состояние, чтобы обновить стейт
            return nextValue;
        });
    }
    useEffect(() => {
        setCurTrack(JSON.parse(localStorage.getItem('idx')), JSON.parse(localStorage.getItem('queue')))
        audioRef.current.loop = localStorage.getItem('loop') !== null ? JSON.parse(localStorage.getItem('loop')) : false
    }, [])
    const [isEditingSong, setEditingSong] = useState<boolean>(false);
    const [curEditingSong, setCurEditingSong] = useState<SongEditInformation>({ video_id: '', title: "", artist: "", cover_file: "null" });
    const editSong = (video_id, title, artist, cover) => {
        setCurEditingSong({ video_id: video_id, title: title, artist: artist, cover_file: cover })
        setEditingSong(true)
    }
    return (
        <AudioContext.Provider value={{ setIsShuffled, isShuffled, audioSourceRef, editSong, queue, isPlaying, currentSong, setCurTrack, setQueue, setPlay, audioRef, playlists, setPlaylists, updatePlaylists, currentSongIdx }}>
            {isEditingSong ? <EditSong curEditingSong={curEditingSong} setCurEditingSong={setCurEditingSong} setEditingSong={setEditingSong} /> : <></>}
            {children}
            <audio crossOrigin="anonymous" onEnded={() => nextTrack()} ref={audioRef} src={`${import.meta.env.VITE_API_URL}${currentSong?.stream_url}`} />
        </AudioContext.Provider>
    );
}

export function useAudio() { return useContext(AudioContext); }

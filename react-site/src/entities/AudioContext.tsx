import { createContext, useState, useContext, useRef, useEffect } from "react";
import type { SongEditInformation, SongInformation } from "./dataInterfaces";
const AudioContext = createContext(null)
export function AudioProvider({ children }) {
    const [isPlaying, setIsPlaying] = useState<boolean>(false);
    const [queue, setQueue] = useState([]);
    const [currentSong, setCurrentSong] = useState<SongInformation>(null);
    const [currentSongIdx, setCurrentSongIdx] = useState<number>(0);
    const audioRef = useRef<HTMLAudioElement>(null)
    const [playlists, setPlaylists] = useState([]);
    const updatePlaylists = () => { fetch('http://127.0.0.1:8000/playlists').then(r => r.json()).then(d => setPlaylists(d)) }

    const nextTrack = () => {
        if (!audioRef.current?.loop) {
            const nextSongIdx = (currentSongIdx + 1) % queue.length
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
    const setPlay = (value: boolean) => {
        setIsPlaying(value)
        if (value)
            audioRef.current?.play()
        else
            audioRef.current?.pause()
    }
    useEffect(() => {
        setCurTrack(localStorage.getItem('idx'), JSON.parse(localStorage.getItem('queue')))
        audioRef.current.loop = localStorage.getItem('loop') !== null ? JSON.parse(localStorage.getItem('loop')) : false
    }, [])
    const [isEditingSong, setEditingSong] = useState<boolean>(false);
    const [curEditingSong, setCurEditingSong] = useState<SongEditInformation>({ video_id: '', title: "", artist: "", cover_file: "null" });
    const editSong = (video_id, title, artist, cover) => {
        setCurEditingSong({ video_id: video_id, title: title, artist: artist, cover_file: cover })
        setEditingSong(true)
    }

    return (
        <AudioContext.Provider value={{ editSong, queue, isPlaying, currentSong, setCurTrack, setQueue, setPlay, audioRef, playlists, setPlaylists, updatePlaylists }}>
            {isEditingSong ? <EditSong curEditingSong={curEditingSong} setCurEditingSong={setCurEditingSong} setEditingSong={setEditingSong} /> : <></>}
            {children}
            <audio onEnded={() => nextTrack()} ref={audioRef} src={"http://127.0.0.1:8000" + currentSong?.stream_url} />
        </AudioContext.Provider>
    );
}
function EditSong({ curEditingSong, setCurEditingSong, setEditingSong }) {
    const form = useRef(null)

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (form.current == null) return;
        const formData = new FormData(form.current);
        try {
            const response = await fetch(`http://127.0.0.1:8000/songs/${curEditingSong.video_id}`, {
                method: 'PATCH',
                body: formData
            });
            if (response.ok) {
                alert('Песня успешно обновлена!');
            } else {
                alert('Произошла ошибка при сохранении.');
            }
        } catch (error) {
            console.error('Ошибка сети:', error);
        }
        await fetch(`http://127.0.0.1:8000/update`)
        setEditingSong(false)
    }

    return (<div onKeyDown={e => { if (e.code == 'Escape') { setEditingSong(false) } }} className="fixed flex p-2 top-1/3 left-1/2 -translate-y-1/2 -translate-x-1/2 bg-surface0 shadow-[0_0_8px_var(--color-sky)] z-3000">
        <form onSubmit={handleSubmit} method='post' ref={form} className='flex' id="songForm" encType="multipart/form-data">
            <div className="relative">
                <input onChange={e => setCurEditingSong(prev => ({ ...prev, cover_file: e.target.files[0] }))} className="w-full h-full absolute top-0 left-0" name="cover_file" type="file" accept="image/*" />
                <img className="w-[6vw] aspect-square" src={typeof curEditingSong.cover_file === 'object' ? URL.createObjectURL(curEditingSong.cover_file) : curEditingSong.cover_file} alt="" />
            </div>
            <div className="block m-auto ml-4 mr-4">
                <input name="title" className="block text-[x-large] text-text font-bold" type="text" onChange={e => setCurEditingSong(prev => ({ ...prev, title: e.target.value }))} value={curEditingSong.title} />
                <input name="artist" className="block text-[large] text-subtext0" type="text" onChange={e => setCurEditingSong(prev => ({ ...prev, artist: e.target.value }))} value={curEditingSong.artist} />
            </div>
            <button className="text-mantle text-[x-large] bg-blue w-fit h-fit p-1 pl-2 pr-2 font-bold m-auto hover:scale-120 hover:shadow-[0_0_6px_var(--color-blue)] active:scale-100" type="submit"></button>
            <button className="absolute -top-8 -right-8 text-mantle text-[large] bg-red w-fit h-fit pl-2 pr-2 font-bold m-auto hover:scale-120 hover:shadow-[0_0_6px_var(--color-blue)] active:scale-100" onClick={() => setEditingSong(false)}></button>
        </form>
    </div>)
}
export function useAudio() { return useContext(AudioContext); }

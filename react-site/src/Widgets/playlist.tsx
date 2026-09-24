import { useEffect, useRef, useState } from 'react'
import CommonInformation from "../shared/baseSongInformation";
import { useAudio } from '../entities/AudioContext';
import type { Playlist, SongElement } from '../entities/dataInterfaces';
import { MusicAPI } from '../entities/api';

function SongMin({ playlistId, id, setCurSong, duration, cover_url, title, artist, video_id }: SongElement) {
    const [startX, setStartX] = useState<number>(0);
    const [currentX, setCurrentX] = useState<number>(0);
    const [isDragging, setIsDragging] = useState<boolean>(false);
    const [wasDragging, setWasDragging] = useState<boolean>(false);
    const [isFetching, setFetching] = useState<boolean>(false);
    const { updatePlaylists } = useAudio()
    const swipeThreshold = -100;
    const dragOffsetX = isDragging ? Math.min(0, currentX - startX) : 0
    const progress = Math.min(1, Math.abs(dragOffsetX) / Math.abs(swipeThreshold));
    const handleStart = (clientX: number) => {
        setStartX(clientX);
        setCurrentX(clientX);
        setIsDragging(true);
        setWasDragging(false)
    };
    const handleDelete = () => {
        if (isFetching) return
        setFetching(true)
        MusicAPI.removeSongFromPlaylist(playlistId, video_id)
            .then(() => { setFetching(false); updatePlaylists() }).catch(err => console.error(err))
    }
    useEffect(() => {
        const handleMove = (e: MouseEvent) => {
            if (!isDragging) return;
            setCurrentX(Math.max(startX + swipeThreshold, e.clientX));
            if (Math.abs(e.clientX - startX) < swipeThreshold / -4)
                setWasDragging(true);
        };
        const handleEnd = (e) => {
            setIsDragging(false);
            if (currentX - startX <= swipeThreshold) handleDelete();
            setStartX(0);
            setCurrentX(0);
        };
        document.addEventListener('mousemove', handleMove);
        document.addEventListener('mouseup', handleEnd);
        return () => {
            document.removeEventListener('mousemove', handleMove);
            document.removeEventListener('mouseup', handleEnd);
        };
    }, [isDragging, startX, currentX])
    return (
        <div style={{ backgroundColor: `color-mix(in srgb, var(--color-maroon) ${progress * 100}%, var(--color-mantle))` }}
            className='relative flex w-full bg-surface1 mt-[0.5vw] after:bg-surface0 after:w-full after:h-[1px] after:bottom-[-0.25vw] after:absolute'>
            <div style={{ transform: `translateX(${dragOffsetX}px)` }}
                onMouseDown={(e) => handleStart(e.clientX)}
                onClick={() => { if (!wasDragging) setCurSong() }}
                className='z-1 hover:bg-surface0 rounded-4x1 w-full song content-center relative flex  bg-mantle'>
                <CommonInformation title={title} duration={duration} artist={artist} cover_url={cover_url} />
                <h1 onClick={e => { e.stopPropagation(); handleDelete() }}
                    className='select-none text-[x-large] pr-4 -mr-2 ml-2 mt-[3px] hover:text-text transition-all duration-200 text-maroon'></h1>
            </div>
            <h1 className='select-none -z-0 absolute right-4 top-1/2 -translate-y-1/2 text-[xx-large] text-mantle'></h1>
        </div >
    )
}


export default function Playlist({ id, name, songs }: Playlist) {
    const [isOpened, setOpened] = useState<boolean>(JSON.parse(localStorage.getItem('playlistsState'))?.at(id) || false);
    const [cname, setName] = useState<string>(name)
    const { setCurTrack, updatePlaylists, setPlaylists } = useAudio()
    const setOpenedState = () => {
        const old = (JSON.parse(localStorage.getItem('playlistsState')) || [false])
        old[id] = !isOpened
        localStorage.setItem('playlistsState', JSON.stringify(old));
        setOpened(!isOpened);
    }
    useEffect(() => {
        updatePlaylists()
    }, [])
    return (
        <div data-id={id} className='playlist hover:border-sky mb-4 border-surface1 border-2 shadow-[0_0_6px_var(--color-mantle)]'>
            <div onClick={() => { setOpenedState(); }} className='flex bg-surface1 p-1'>
                <input onInput={(e) => MusicAPI.changePlaylist(id, e.target.value).catch(err => console.error(err))}
                    onClick={e => e.stopPropagation()}
                    onChange={e => setName(e.target.value)}
                    value={cname}
                    className='outline-0 no-underline select-none ml-2 text-text font-bold' />
                <button onClick={e => {
                    if (confirm('Удалить плейлист: ' + cname)) {
                        MusicAPI.removePlayist(id).catch(err => console.error(err))
                        setPlaylists(prev => prev.filter(el => el.id !== id))
                    }
                    e.stopPropagation()
                }} className='pl-1 pr-2 rounded-full hover:bg-overlay0 hover:scale-120 transition-all duration-200 mr-2 text-red ml-auto'></button>
                <button className='select-none text-text ml-2 mr-2'>&gt;</button>
            </div>
            {isOpened ? <div className='p-2 w-full bg-mantle max-h-[30vw] overflow-auto'>
                {songs?.map((song, idx) => <SongMin key={idx} setCurSong={async () => { await setCurTrack(idx, songs) }} playlistId={id} {...song} />)}
            </div> : null}
        </div >
    )
}

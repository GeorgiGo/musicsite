import { useEffect, useState, useRef } from "react";
import type { SongElementInformation } from "../entities/dataInterfaces";
import CommonInformation from "../shared/baseSongInformation";
import { useAudio } from "../entities/AudioContext";

export function Song({ isPlaying, video_id, baseSongInformation, setCurSong }: SongElementInformation) {
    const [startX, setStartX] = useState<number>(0);
    const [startY, setStartY] = useState<number>(0);
    const [currentX, setCurrentX] = useState<number>(0);
    const [currentY, setCurrentY] = useState<number>(0);
    const [isDragging, setIsDragging] = useState<boolean>(false);
    const [wasDragging, setWasDragging] = useState<boolean>(false);
    const [isPlaylisting, setPlaylisting] = useState<boolean>(false);
    const cardRef = useRef<HTMLDivElement>(null);
    const { editSong, updatePlaylists } = useAudio()
    // Порог в пикселях, после которого песня считается сохраненной
    const swipeThreshold = -120;
    const API_URL = window.location.hostname == 'localhost' ? '127.0.0.1' : '192.168.0.105'
    // Вычисляем текущее смещение влево (берем только отрицательные значения)
    const dragOffsetX = isDragging ? (!isPlaylisting ? Math.min(Math.abs(swipeThreshold), currentX - startX) : currentX - startX) : 0
    const dragOffsetY = isPlaylisting ? currentY - startY : 0
    const progress = Math.min(1, Math.abs(dragOffsetX) / Math.abs(swipeThreshold));
    const handleStart = (clientX: number, clientY: number) => {
        setStartX(clientX);
        setStartY(clientY);
        setCurrentX(clientX);
        setCurrentY(clientY);

        setIsDragging(true);
        setWasDragging(false)
        setPlaylisting(false)
    };
    useEffect(() => {
        const handleMove = (e: MouseEvent) => {
            if (!isDragging) return;
            if (isPlaylisting) setCurrentY(e.clientY);
            setCurrentX(isPlaylisting ? e.clientX : Math.max(startX + swipeThreshold, e.clientX));
            // Если свайпнул сильнее порога, можно визуально показать, что триггер сработал
            if (Math.abs(e.clientX - startX) < swipeThreshold / -4) {
                setWasDragging(true);
            } else if (e.clientX - startX > swipeThreshold * -2) {
                setPlaylisting(true)
            }
        };

        // --- ОБРАБОТЧИКИ ЗАВЕРШЕНИЯ ---
        const handleEnd = (e) => {
            setIsDragging(false);
            setPlaylisting(false);

            if (isPlaylisting) {
                const playlistId = e.target.closest('.playlist')?.dataset.id
                console.log(playlistId)
                console.log(video_id)
                if (video_id !== undefined && playlistId !== undefined) {
                    fetch(`http://${API_URL}:8000/playlists/${playlistId}/add_song/${video_id}`, { method: 'POST' }).then(() => updatePlaylists())
                }
            } else if (currentX - startX <= swipeThreshold) {
                editSong(video_id, baseSongInformation.title, baseSongInformation.artist, baseSongInformation.cover_url)
            }
            // Сбрасываем координаты
            setStartX(0);
            setCurrentX(0);
        };
        document.addEventListener('mousemove', handleMove);
        document.addEventListener('mouseup', handleEnd);

        // Обязательно чистим за собой слушатели, когда dragging завершился или компонент размонтировался
        return () => {
            document.removeEventListener('mousemove', handleMove);
            document.removeEventListener('mouseup', handleEnd);
        };
    }, [isPlaylisting, isDragging, startX, startY, currentX, currentY])
    const onClickSong = (e) => {
        if (!wasDragging) { setCurSong() }
    }
    return (
        <div style={{ pointerEvents: (isPlaylisting ? 'none' : 'auto'), backgroundColor: `color-mix(in srgb, var(--color-${dragOffsetX > 0 ? 'teal' : 'blue'}${isPlaylisting ? 'n' : ''}) ${progress * 100}%, var(--color-mantle))` }} className='relative flex w-full bg-surface1 mt-[0.5vw] after:bg-surface0 after:w-[100%] after:h-[1px] after:bottom-[-0.25vw] after:absolute'>
            <div style={{ zIndex: (isPlaylisting ? 50 : 1), transform: `translate(${dragOffsetX}px, ${dragOffsetY}px)` }} ref={cardRef} onMouseDown={(e) => handleStart(e.clientX, e.clientY)} onClick={onClickSong} className={`transition-colors duration-300 group/card relative rounded-4x1 w-full song content-center relative flex  bg-${isPlaying ? 'surface0' : 'mantle'} [&:hover:not(:has(.but:hover))]:bg-surface0`}>
                <CommonInformation {...baseSongInformation} />
                <div className="but group flex z-60 ml-1">
                    <button className="transition-all  group-hover:pr-2 group-hover:pl-4 justify-between inset duration-300 group-hover:opacity-0 group-hover:invisible opacity-100 hover:scale-130 pl-1 pr-1 m-1 select-none text-[large] text-subtext0">󰇙</button>
                    <div className="absolute transition-all duration-300 group-hover:opacity-100 group-hover:visible opacity-0 invisible flex flex-row text-center">
                        <button onClick={e => { e.stopPropagation(); }} className="hover:scale-130 pl-1 pr-1 m-3 mr-0 ml-0 select-none text-[large] text-text">󰐒</button>
                        <button onClick={e => { e.stopPropagation(); editSong(video_id, baseSongInformation.title, baseSongInformation.artist, baseSongInformation.cover_url); }} className="hover:scale-130 pl-1 pr-1 m-3 mr-0 ml-0 select-none text-[large] text-text"></button>
                    </div>
                </div>
            </div>
            <h1 className='select-none -z-0 absolute left-4 top-1/2 -translate-y-1/2 text-[xx-large] text-mantle'>󰐒</h1>
            <h1 className='select-none -z-0 absolute right-4 top-1/2 -translate-y-1/2 text-[xx-large] text-mantle'></h1>
        </div>
    )
}


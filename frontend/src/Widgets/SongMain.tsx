import { useEffect, useState, useRef } from "react";
import CommonInformation from "../shared/baseSongInformation";
import { useAudio } from "../entities/contexts/AudioContext";
import type { Playlist, SongElement } from "../entities/dataInterfaces";
import { EditSVG, ListPlusSVG } from "../shared/svgIcons";
import { MusicAPI } from "../entities/api";
import Modal from "./ModalWindow";

export function SongEl({ isPlaying, video_id, title, artist, cover_url, duration, setCurSong }: SongElement) {
    const [startX, setStartX] = useState<number>(0);
    const [startY, setStartY] = useState<number>(0);
    const [currentX, setCurrentX] = useState<number>(0);
    const [currentY, setCurrentY] = useState<number>(0);
    const [isDragging, setIsDragging] = useState<boolean>(false);
    const [wasDragging, setWasDragging] = useState<boolean>(false);
    const [isPlaylisting, setPlaylisting] = useState<boolean>(false);
    const cardRef = useRef<HTMLDivElement>(null);
    const draggedHeight = useRef<number>(0);
    const { editSong, updatePlaylists, playlists } = useAudio()
    // Порог в пикселях, после которого песня считается сохраненной
    const swipeThreshold = -120;
    // Вычисляем текущее смещение влево (берем только отрицательные значения)
    const dragOffsetX = isDragging ? (!isPlaylisting ? Math.min(Math.abs(swipeThreshold), currentX - startX) : currentX - startX) : 0
    const dragOffsetY = isPlaylisting ? currentY - 30 : 0
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
                draggedHeight.current = cardRef.current.getBoundingClientRect().height
                setPlaylisting(true)
            }
        };

        // --- ОБРАБОТЧИКИ ЗАВЕРШЕНИЯ ---
        const handleEnd = async (e: MouseEvent) => {
            setIsDragging(false);
            setPlaylisting(false);

            if (isPlaylisting) {
                const playlistId = e.target.closest('.playlist')?.dataset.id
                if (video_id !== undefined && playlistId !== undefined)
                    await MusicAPI.addSongToPlaylist(playlistId, video_id).then(() => updatePlaylists()).catch(err => console.error(err))
            } else if (currentX - startX <= swipeThreshold) {
                editSong(video_id, title, artist, cover_url)
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
    const [isModalPlaylistOpen, setModalPlaylistOpen] = useState<boolean>(false);
    return (
        <div style={{
            pointerEvents: (isPlaylisting ? 'none' : 'auto'),
            height: (isPlaylisting ? `${draggedHeight.current}px` : 'auto'),
            backgroundColor: `color-mix(in srgb, var(--color-${dragOffsetX > 0 ? 'teal' : 'blue'}${isPlaylisting ? 'n' : ''}) ${progress * 100}%, var(--color-mantle))`
        }}
            className='relative flex w-full bg-surface1 mt-[2vh] xl:mt-[1vh] after:bg-surface0 after:w-[100%] after:h-[1px] after:bottom-[-1vh] xl:after:bottom-[-0.5vh] after:absolute'>

            <div style={{
                zIndex: (isPlaylisting ? 900 : 1),
                position: (isPlaylisting ? 'fixed' : 'unset'),
                transform: `translate(${dragOffsetX}px, ${dragOffsetY}px)`
            }}
                ref={cardRef}
                onMouseDown={(e) => handleStart(e.clientX, e.clientY)} onClick={onClickSong}
                className={`transition-colors duration-300 group/card relative rounded-4x1 w-full song top-0 content-center relative flex  bg-${isPlaying ? 'surface0' : 'mantle'} [&:hover:not(:has(.but:hover))]:bg-surface0`}>
                <Modal
                    title={`Добавить ${title} в плейлист ...`}
                    isOpen={isModalPlaylistOpen} onClose={() => setModalPlaylistOpen(false)}>
                    <div className="flex gap-1 flex-wrap p-1">
                        {playlists.map((pl: Playlist) =>
                            <h1 onClick={() => {
                                setModalPlaylistOpen(false);
                                if (video_id !== undefined && pl.id !== undefined)
                                    MusicAPI.addSongToPlaylist(pl.id, video_id).then(() => updatePlaylists()).catch(err => console.error(err))
                            }}
                                className="hover:text-shadow-[0_0_2px_var(--color-text)] hover:border-blue select-none text-text bg-base w-fit m-0 p-1 rounded-xl border border-surface1">{pl.name}</h1>)}
                    </div>
                </Modal>

                <CommonInformation title={title} artist={artist} duration={duration} cover_url={cover_url} />

                <div className="but group flex z-60 m-auto xl:ml-1 mr-2">
                    <button className="transition-[padding,_scale,_opacity]  group-hover:pr-2 group-hover:pl-4 justify-between inset duration-300 group-hover:opacity-0 group-hover:invisible opacity-100 hover:scale-130 pl-1 pr-1 m-1 select-none text-[large] text-subtext0">󰇙</button>

                    <div className="absolute transition-opacity transition-[scale, opacity] duration-300 group-hover:opacity-100 group-hover:visible xl:opacity-0 xl:invisible flex flex-row text-center">

                        <button onClick={e => { e.stopPropagation(); setModalPlaylistOpen(true) }}
                            className="hover:scale-130 pl-1 pr-1 m-3 mr-0 ml-0 select-none text-[large] text-text">
                            <ListPlusSVG /> </button>
                        <button onClick={e => { e.stopPropagation(); editSong(video_id, title, artist, cover_url); }}
                            className="hover:scale-130 pl-1 pr-2 m-3 mr-0 ml-0 select-none text-[large] text-text">
                            <EditSVG /></button>
                    </div>
                </div>
            </div>
            <h1 className='select-none -z-0 absolute left-4 top-1/2 -translate-y-1/2 text-[xx-large] text-mantle'>󰐒</h1>
            <h1 className='select-none -z-0 absolute right-4 top-1/2 -translate-y-1/2 text-[xx-large] text-mantle'></h1>
        </div >
    )
    // 󰐒
}


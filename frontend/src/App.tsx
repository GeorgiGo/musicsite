import { useEffect, useState } from 'react'
import MainPlayer from './Widgets/mainSoundPlayer';
import SoundSearch from './Widgets/mainSoundSearch';
import PlaylistEl from './Widgets/playlist';
import { useAudio } from './entities/contexts/AudioContext';
import { SongEl } from "./Widgets/SongMain"
import './App.css'
import type { Playlist, Song } from './entities/dataInterfaces';
import { AudioVisualizerO } from './Widgets/AudioVisualizer';
import { MusicAPI } from './entities/api';
import { StatisticsTab } from './Widgets/statistics';
import { SettingsTab } from './Widgets/settings';
import { ChartPieSVG, MusicSVG, SettingsSVG } from './shared/svgIcons';
import { useSettings } from './entities/contexts/SettingsContext';

function MainSoundField({ curTab }) {
    const { setCurTrack, currentSong } = useAudio();
    const [songs, setSongs] = useState<Song[]>([]);
    const setSongFromMain = async (idx) => { await setCurTrack(idx, songs) }

    return (<div style={{ display: (curTab === 'MAIN' ? 'block' : 'none') }} className="opacity-90 xl:opacity-60 hover:opacity-95 transition-all duration-300 w-full xl:w-[41vw] m-auto mt-[1vh] p-4 pl-2 xl:pl-6 pr-2 xl:pr-6 backdrop-blur-[2px] bg-mantle block relative ml-[25vw]">
        <SoundSearch setSongs={setSongs} />
        <ul className="m-[0.5vw] mt-[2vh] -z-9 overflow-y-scroll overflow-x-visible max-h-[72vh] xl:max-h-[81vh] scrollbar-none">
            {songs.map((song, idx) => <SongEl isPlaying={currentSong?.video_id == song.video_id} key={song.stream_url} {...song} setCurSong={() => setSongFromMain(idx)} />)}
        </ul>
    </div>)
}
function PlaylistField({ curTab }) {
    const { playlists, setPlaylists, } = useAudio()
    const [canCreatePlaylist, allowCreatePlaylist] = useState<boolean>(true);
    useEffect(() => { MusicAPI.getAllPlaylists().then(d => setPlaylists(d)).catch(err => console.error(err)) }, [])

    return (
        <div className="z-1 w-[25vw] mr-[2.5vw] mt-[1vh]" style={{ display: (curTab === 'MAIN' ? 'block' : 'none') }}>
            <h1 className='select-none pointer-events-none text-blue text-[large] font-bold m-auto w-fit '>󰲸 Плейлисты 󰲸</h1>
            <div className='overflow-y-scroll max-h-3/4 scrollbar-track-crust scrollbar-thumb-surface1 scrollbar-thin pr-2'>
                {playlists.map((pl: Playlist) => <PlaylistEl key={pl.id} {...pl} />)}
                <button onClick={() => {
                    if (canCreatePlaylist) {
                        allowCreatePlaylist(false);
                        MusicAPI.createPlaylist()
                            .then(d => { setPlaylists((prev: Playlist[]) => [...prev, d]); allowCreatePlaylist(true) })
                            .catch(err => console.error(err))
                    }
                }
                } className='hover:text-text hover:bg-surface1 w-full text-[large] text-subtext0 bg-surface0'> new </button>
            </div>
        </div>
    )
}
export function FieldButton({ curTab, setCurTab, targetTab, text, children }) {
    return (
        <label className="group relative p-2 w-fit ">
            <input
                name='tab' type="radio"
                checked={curTab == targetTab}
                onChange={() => setCurTab(targetTab)}
                className="sr-only peer" />
            {children}
            <div className="peer-checked:h-2/3 peer-checked:bg-blue w-2 h-0 group-hover:h-1/3 bg-surface1 absolute top-1/2 left-0 -translate-1/2"></div>
            <span className="left-full bottom-1/2 translate-y-1/2 absolute mb-0
                        pointer-events-none select-none opacity-0 scale-95 transition-all duration-200 ease-out group-hover:opacity-100 group-hover:scale-100
                        px-2 py-0.5 text-[small] font-medium text-text bg-base border border-surface0 rounded-md rounded-bl-none shadow-xl
        whitespace-nowrap pointer-events-none
 ">{text}</span>
        </label>

    )
}
function App() {
    const [visshow, setVisShow] = useState<boolean>(true);
    const show = (e) => { setVisShow(true) }
    const hide = (e) => { setVisShow(false) }
    const onKeyDownHndlr = (e: KeyboardEvent) => {
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
        switch (e.code) {
            case 'Escape':
                setCurTab('MAIN')
                break;
            case 'KeyI':
                setCurTab('SETTINGS')
                break;
            case 'KeyP':
                setCurTab('STATISTICS')
                break;
            case 'KeyN':
                setCurTab('MAIN')
                break;
        }
    }
    useEffect(() => {
        document.addEventListener('blur', hide)
        document.addEventListener('focus', show)
        document.addEventListener('keydown', onKeyDownHndlr)
        const onCtx = (e: MouseEvent) => {
            e.preventDefault();
        }
        document.addEventListener('contextmenu', onCtx);
        return () => {
            document.removeEventListener('blur', hide)
            document.removeEventListener('focus', show)
            document.removeEventListener('contextmenu', onCtx);
            document.removeEventListener('keydown', onKeyDownHndlr)
        }
    }, [])
    const [curTab, setCurTab] = useState<'SETTINGS' | 'MAIN' | 'STATISTICS'>('MAIN');
    const { showVisualizer } = useSettings()
    return (
        <>
            <AudioVisualizerO isShow={(visshow && showVisualizer == 'SHOW') || showVisualizer == 'ALWAYS'} />
            <div className="flex">
                <div className="w-fit ml-4 flex flex-col gap-4 mt-8 z-10">
                    <FieldButton text='Главная (N)' children={<MusicSVG width='50px' height='50px' className='text-peach' />} targetTab='MAIN' curTab={curTab} setCurTab={setCurTab} />
                    <FieldButton text='Статистика (P)' children={<ChartPieSVG width='50px' height='50px' className='text-blue' />} targetTab='STATISTICS' curTab={curTab} setCurTab={setCurTab} />
                    <FieldButton text='Настройки (I)' children={<SettingsSVG width='50px' height='50px' className='text-mauve' />} targetTab='SETTINGS' curTab={curTab} setCurTab={setCurTab} />
                </div>
                <MainSoundField curTab={curTab} />
                <PlaylistField curTab={curTab} />
                <StatisticsTab curTab={curTab} />
                <SettingsTab curTab={curTab} />
            </div >
            <MainPlayer />
        </>
    )
}

export default App

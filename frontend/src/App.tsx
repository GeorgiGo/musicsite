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
import Modal from './Widgets/ModalWindow';

function MainSoundField({ curTab }) {
    const { setCurTrack, currentSong, setPlay } = useAudio();
    const [songs, setSongs] = useState<Song[]>([]);
    const setSongFromMain = async (idx) => {
        await setCurTrack(idx, songs)
        setPlay(true)
    }
    const { hideSongList } = useSettings()
    const { findIn } = useAudio()

    return (<div style={{ display: (curTab === 'MAIN' ? 'block' : 'none') }}
        className={"transition-all duration-300 w-[55vw] 2xl:w-[41vw] m-auto mt-[1vh] p-4 px-6 backdrop-blur-[2px] bg-mantle block relative 2xl:ml-[25vw] mainSoundField " + (hideSongList == 'SHOW' || songs.length == 0 ? 'show' : hideSongList == 'OPACITY' ? 'auto' : 'hide')}>
        <div className='w-full flex'>
            <SoundSearch setSongs={setSongs} />
        </div>
        <div className="m-[0.2vw] mt-4 -z-9 overflow-y-scroll overflow-x-hidden  max-h-[72vh] xl:max-h-[83vh] scrollbar-none">
            {songs.map((song, idx) => <SongEl isPlaying={currentSong?.video_id == song.video_id} key={song.video_id} {...song} setCurSong={() => setSongFromMain(idx)} />)}
            {songs.length == 0 && <div className='text-text font-bold text-xl m-auto w-fit mt-4'>{findIn == 'YANDEX' ? 'Поиск в Яндекс.Музыка' : 'У вас нет сохранненных на диск песен. '} </div>}
            {songs.length == 0 && findIn == 'LOCAL' && <div className='text-subtext0 m-auto w-fit my-1'>Поищите в яндексе, добавте вручную или выбрете директорию</div>}
        </div>
    </div>)
}
function PlaylistField({ curTab }) {
    const { playlists, setPlaylists, } = useAudio()
    const [canCreatePlaylist, allowCreatePlaylist] = useState<boolean>(true);
    useEffect(() => { MusicAPI.getAllPlaylists().then(d => setPlaylists(d)).catch(err => console.error(err)) }, [])

    return (
        <div className="z-1 w-[25vw] mr-[2.5vw] mt-[1vh]" style={{ display: (curTab === 'MAIN' ? 'block' : 'none') }}>
            <h1 className='select-none pointer-events-none text-blue text-[large] font-bold m-auto w-fit '>󰲸 Плейлисты 󰲸</h1>
            <div className='overflow-y-scroll max-h-[85vh] scrollbar-track-crust scrollbar-thumb-surface1 scrollbar-thin pr-2'>
                {playlists.map((pl: Playlist) => <PlaylistEl key={pl.id} {...pl} />)}
                <button onClick={() => {
                    if (canCreatePlaylist) {
                        allowCreatePlaylist(false);
                        MusicAPI.createPlaylist()
                            .then(d => { setPlaylists((prev: Playlist[]) => [...prev, d]); allowCreatePlaylist(true) })
                            .catch(err => console.error(err))
                    }
                }
                } className='hover:text-text hover:bg-surface1 w-full text-[large] rounded-2xl text-subtext0 bg-surface0'>новый плейлист</button>
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
            case 'Escape': setCurTab('MAIN'); break;
            case 'KeyI': setCurTab('SETTINGS'); break;
            case 'KeyP': setCurTab('STATISTICS'); break;
            case 'KeyN': setCurTab('MAIN'); break;
            case 'F5': e.preventDefault(); window.location.reload(); break;
        }
    }
    useEffect(() => {
        document.addEventListener('blur', hide)
        document.addEventListener('focus', show)
        document.addEventListener('keydown', onKeyDownHndlr)
        const onCtx = (e: MouseEvent) => { e.preventDefault(); }
        //document.addEventListener('contextmenu', onCtx);
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
            <Auth />
        </>
    )
}
export interface Authorized {
    authorized: boolean;
    verification_url?: string;
    user_code?: string;
    user?: string;
}
function Auth() {
    const { findIn, setFindIn } = useAudio()
    const [showModal, setShowModal] = useState<boolean>(false);
    const [vUrl, setVUrl] = useState<string>('');
    const [vCode, setVCode] = useState<string>('');
    useEffect(() => {
        if (findIn == 'YANDEX') {
            MusicAPI.checkYandexAuth().then(d => {
                if (!d.authorized) {
                    setTimeout(() => {
                        MusicAPI.checkYandexAuth().then(d => {
                            setShowModal(true);
                            setVUrl(d.verification_url)
                            setVCode(d.user_code)
                        })
                    }, 200);
                }
            })
        }
    }, [findIn]);
    const [copied, setCopied] = useState<boolean>(false);
    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(vCode);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error('Failed to copy text:', err);
        }
    };
    return (<>
        <Modal title="Авторизуйтесь в яндекс пожалуйста" isOpen={showModal} onClose={() => { setShowModal(false); setFindIn('LOCAL') }}>
            <div className='flex flex-col'>
                <a target="_blank" rel="noopener noreferrer" className='bg-blue px-4 py-2 rounded-xl text-mantle font-bold text-xl m-auto' href={vUrl} onClick={() => setShowModal(false)}>Авторизоваться</a>
                <div style={{ borderColor: (copied ? 'var(--color-green)' : 'var(--color-surface0)') }} className='w-fit m-auto my-4 relative rounded-xl border-2 px-4 py-2 transition-colors transition-200'>

                    <span className='select-none pointer-events-none bg-mantle px-3 text-subtext0 font-bold absolute -top-1/3 left-1/2 -translate-x-1/2'>код</span>
                    <span className='text-text font-bold text-xl select-none' onClick={handleCopy}>{vCode}</span>
                </div>
            </div>
        </Modal>
    </>)
}

export default App

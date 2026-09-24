import { useEffect, useState } from 'react'
import MainPlayer from './Widgets/mainSoundPlayer';
import SoundSearch from './Widgets/mainSoundSearch';
import Playlist from './Widgets/playlist';
import { useAudio } from './entities/AudioContext';
import { SongEl } from "./Widgets/SongMain"
import './App.css'
import type { Song } from './entities/dataInterfaces';
import AudioVisualizer from './Widgets/AudioVisualizer';
import { MusicAPI } from './entities/api';
import { PlusSVG } from './shared/svgIcons';
import AddNewSongs from './Widgets/addSongFiles';

function MainSoundField() {
    const [songs, setSongs] = useState<Song[]>([]);
    const { setCurTrack, currentSong } = useAudio();
    const setSongFromMain = async (idx) => { await setCurTrack(idx, songs) }
    return (<div className="opacity-90 xl:opacity-60 hover:opacity-95 transition-all duration-300 w-full xl:w-[41vw] m-auto mt-[1vh] p-4 pl-2 xl:pl-6 pr-2 xl:pr-6 backdrop-blur-[2px] bg-mantle block relative">
        <SoundSearch setSongs={setSongs} />
        <ul className="m-[0.5vw] mt-[2vh] -z-9 overflow-y-auto max-h-[72vh] xl:max-h-[81vh] scrollbar-none">
            {songs.map((song, idx) => <SongEl isPlaying={currentSong?.video_id == song.video_id} key={song.stream_url} {...song} setCurSong={() => setSongFromMain(idx)} />)}
            <AddNewSongs setSongs={setSongs} />
        </ul>
    </div>)
}
function PlaylistField() {
    const { playlists, setPlaylists, } = useAudio()
    const [canCreatePlaylist, allowCreatePlaylist] = useState<boolean>(true);
    const [search, setSearch] = useState<string>('')
    useEffect(() => { MusicAPI.getAllPlaylists().then(d => setPlaylists(d)).catch(err => console.error(err)) }, [])

    return (
        <div className="z-1 w-[25vw] mr-[2.5vw] mt-[1vh] hidden xl:block">
            <h1 className='text-blue text-[large] font-bold m-auto w-fit '>󰲸 Плейлисты 󰲸</h1>
            <input onChange={e => setSearch(e.target.value)} placeholder='Поиск...' className='hidden outline-0 text-text pl-2 pr-2 hover:bg-surface1 bg-surface0 w-full mb-4' type="text" />
            <div className=''>
                {playlists.filter(el => el.name.includes(search)).map(pl => <Playlist key={pl.id} {...pl} />)}
                <button onClick={() => {
                    if (canCreatePlaylist) {
                        allowCreatePlaylist(false);
                        MusicAPI.createPlaylist()
                            .then(d => { setPlaylists(prev => [...prev, d]); allowCreatePlaylist(true) })
                            .catch(err => console.error(err))
                    }
                }
                } className='hover:text-text hover:bg-surface1 w-full text-[large] text-subtext0 bg-surface0'> new </button>
            </div>
        </div>
    )
}

function App() {
    return (
        <>
            <AudioVisualizer />
            <div className="flex">
                <div className="w-[25vw] ml-[2.5vw]  hidden xl:block"></div>
                <MainSoundField />
                <PlaylistField />
            </div >
            <MainPlayer />
        </>
    )
}

export default App

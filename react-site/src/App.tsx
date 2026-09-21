import { useEffect, useRef, useState } from 'react'
import MainPlayer from './Widgets/mainSoundPlayer';
import SoundSearch from './Widgets/mainSoundSearch';
import Playlist from './Widgets/playlist';
import { useAudio } from './entities/AudioContext';
import { Song } from "./Widgets/SongMain"
import './App.css'

function MainSoundField() {
    const [songs, setSongs] = useState([]);
    const { setCurTrack, currentSong } = useAudio();
    //useEffect(() => console.log(songs), [songs])
    const setSongFromMain = async (idx) => {
        await setCurTrack(idx, songs)
    }
    return (<div className="w-full xl:w-[41vw] m-auto mt-[1vh] p-[5px] bg-mantle block relative">
        <SoundSearch setSongs={setSongs} />
        <ul className="m-[0.5vw] mt-[2vh] -z-9 overflow-x-auto overflow-t-hidden max-h-[75vh] xl:max-h-[82vh] scrollbar-none">
            {songs.map((song, idx) => <Song isPlaying={currentSong?.video_id == song.video_id} key={song.stream_url} video_id={song.video_id} baseSongInformation={{ title: song.title, artist: song.artist, cover_url: song.cover_url, duration: song.duration }} setCurSong={() => setSongFromMain(idx)} />)}
        </ul>
    </div>)
}
function PlaylistField() {
    const { playlists, setPlaylists, } = useAudio()
    const [canCreatePlaylist, allowCreatePlaylist] = useState<boolean>(true);
    const [search, setSearch] = useState<string>('')
    const API_URL = window.location.hostname == 'localhost' ? '127.0.0.1' : '192.168.0.105'
    useEffect(() => { fetch(`http://${API_URL}:8000/playlists`).then(r => r.json()).then(d => setPlaylists(d)) }, [])

    return (
        <div className="w-[25vw] mr-[2.5vw] mt-[1vh] hidden xl:block">
            <h1 className='text-blue text-[large] font-bold m-auto w-fit '>󰲸 Плейлисты 󰲸</h1>
            <input onChange={e => setSearch(e.target.value)} placeholder='Поиск...' className='outline-0 text-text pl-2 pr-2 hover:bg-surface1 bg-surface0 w-full mb-4' type="text" />
            <div className=''>
                {playlists.filter(el => el.name.includes(search)).map(pl => <Playlist {...pl} />)}
                <button onClick={() => {
                    if (canCreatePlaylist) {
                        allowCreatePlaylist(false);
                        fetch(`http://${API_URL}:8000/playlist`, { method: 'POST', headers: { 'Content-Type': 'application/json;charset=utf-8' }, body: JSON.stringify({ name: "new playlist", additional_data: "" }) })
                            .then(r => r.json()).then(d => { setPlaylists(prev => [...prev, d]); allowCreatePlaylist(true) })
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

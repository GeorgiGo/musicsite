import { useCallback, useEffect, useRef, useState } from 'react'
import { MusicSVG, SearchSVG, UpdateSVG } from '../shared/svgIcons';
import { SearchDropdown } from '../shared/searchDropdown';
import type { Song } from '../entities/dataInterfaces';
import { MusicAPI } from '../entities/api';
import { useAudio } from '../entities/contexts/AudioContext';
import AddNewSongs from './addSongFiles';

function SearchClearButton({ setSearch }) {
    return (<button onClick={() => setSearch('')} className="peer right-0 hover:bg-red select-none absolute bg-maroon w-[1.2vw] text-center text-mantle"></button>)
}
/**
 * Searchbar for `songs`
 *
 * @param setSongs - fuction to set Songs
 */
export default function SoundSearch({ setSongs }) {
    const [search, setSearch] = useState<string>('');
    const [iSongs, setISongs] = useState<Song[]>([]);
    const [isFocused, setFocused] = useState<boolean>(false);
    const [searchSuggetions, setSearchSuggetions] = useState<string[]>([]);
    const [isSearching, setSearching] = useState<boolean>(false);
    const inputElRef = useRef<HTMLInputElement>(null);
    const { setMainQueue, findIn, setFindIn } = useAudio();
    const searchSongs = async () => {
        setSearching(true)
        let _f: 'LOCAL' | 'YANDEX';
        setFindIn((prev: 'LOCAL' | 'YANDEX') => { _f = prev; return prev; });
        if (findIn == 'YANDEX') {
            await MusicAPI.searchYandexSongs(search).then(s => { setMainQueue(s); setSongs(s); setISongs(s); }).catch(err => console.log(err));
        }
        else {
            await MusicAPI.searchLocalSongs(search).then(s => {
                setMainQueue(s);
                setISongs(s);
                setSongs(search ? s.filter(song => [...search.toLowerCase()]
                    .every(l => song.title.toLowerCase().includes(l) || song.artist.toLowerCase().includes(l))) : s);
            }).catch(err => console.error(err))
        }
        setSearching(false)
    }
    useEffect(() => {
        searchSongs()
        const KeyDown = (e: KeyboardEvent) => {
            const trg = e.target as HTMLElement
            if (trg.tagName != 'INPUT') return;
            if (e.code == 'Enter') searchSongs();
        }
        document.addEventListener('keydown', KeyDown)
        return () => {
            document.removeEventListener('keydown', KeyDown)
        }
    }, [])
    useEffect(() => {
        if (search) {
            if (findIn == 'LOCAL') {
                let array = [...new Set([...iSongs.map(song => song.title), ...iSongs.map(song => song.artist)])]
                    .filter(el => el.toLowerCase().includes(search.toLowerCase().split(' ').at(-1)))
                    .slice(0, 10)
                    .map(el => [...search.toLowerCase().split(' ').slice(0, -1), el].join(' '))
                setSearchSuggetions(array)
            } else {
                MusicAPI.searchYandexSong_s(search).then(s => setSearchSuggetions(s)).catch(err => console.error(err));
            }
        }
        else
            setSearchSuggetions([])
        function filterSongs() {
            if (!search) return iSongs
            return iSongs.filter(song => [...search.toLowerCase()].every(l => song.title.toLowerCase().includes(l) || song.artist.toLowerCase().includes(l)))
        }
        //if (findIn == 'LOCAL') setSongs(filterSongs)
    }, [search, iSongs])

    return (
        <>

            {isSearching ? <div className="z-1000 backdrop-blur-[6px] w-full text-shadow-[0_0_22px_#89B4FA] fixed top-0 left-0 h-full text-blue  text-[xx-large] text-center pt-[33vh]">Загрузка...</div> : <></>}

            <div className="z-2 m-auto mt-[1vh] relative flex w-fill" onBlur={() => setFocused(false)}>
                <div className='mr-1'>
                    <div onClick={() => { if (findIn == 'LOCAL') { setFindIn('YANDEX') } else { setFindIn('LOCAL') } }}
                        style={{ background: (findIn == 'LOCAL' ? 'var(--color-sky)' : 'var(--color-yellow)') }}
                        className='relative h-full p-auto pt-1'>
                        <MusicSVG className="text-mantle scale-80" />
                    </div>
                </div>
                {findIn == 'LOCAL' ? <div className='mr-4'> <AddNewSongs setSongs={setSongs} /> </div> : <></>}

                <div className="relative w-4/5 ">

                    <div onClick={() => searchSongs()} className="absolute left-0 select-none text-mantle bg-blue absolute w-fit p-1 text-center h-full">
                        <SearchSVG />
                    </div>

                    {search ? <SearchClearButton setSearch={() => setSearch('')} /> : <></>}

                    <input ref={inputElRef} onFocus={() => setFocused(true)} placeholder='Поиск...' type="text"
                        className="font-bold peer-hover:line-through hover:outline-2 focus:outline-2 focus:outline-mauve outline-blue outline-0 text-text pl-[8vw] xl:pl-[1.5vw] search-input w-full bg-surface0 not-placeholder-shown:bg-surface1" onChange={(e) => { setSearch(e.target.value); }} value={search} />

                </div>

                <div className='ml-0'>
                    <div onClick={() => MusicAPI.updateSongLibrary().then(() => MusicAPI.searchLocalSongs(search).then(s => setMainQueue(s)).catch(err => console.log(err))).catch(e => console.error(e))}
                        className='bg-blue w-min h-min p-1 text-mantle font-bold select-none opacity-80 hover:opacity-100 hover:shadow-[0_0_10px_var(--color-blue)]'>
                        <UpdateSVG />
                    </div>
                </div>

                <div className="search-dropdown absolute z-1 w-full mt-8">
                    {isFocused ?
                        <SearchDropdown dropdownData={searchSuggetions} searchFunc={searchSongs} search={search} setValue={setSearch} inputElRef={inputElRef} /> : null}
                </div>
            </div>
        </>
    )
}


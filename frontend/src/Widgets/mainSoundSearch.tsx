import { useCallback, useEffect, useRef, useState, type Dispatch, type SetStateAction } from 'react'
import { MusicSVG, SearchSVG, UpdateSVG } from '../shared/svgIcons';
import { SearchDropdown } from '../shared/searchDropdown';
import type { Artist, Song } from '../entities/dataInterfaces';
import { MusicAPI } from '../entities/api';
import { useAudio } from '../entities/contexts/AudioContext';
import AddNewSongs from './addSongFiles';

/**
 * Searchbar for `songs`
 *
 * @param setSongs - fuction to set Songs
 */
export default function SoundSearch({ setSongs, setArtists }: { setSongs: Dispatch<SetStateAction<Song[]>>, setArtists: Dispatch<SetStateAction<Artist[]>> }) {
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
            await MusicAPI.searchYandexSongs(search).then(s => {
                setMainQueue(s.tracks); setSongs(s.tracks); setISongs(s.tracks);
                setArtists(s.artists);
            }).catch(err => console.log(err));
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
        return () => { }
    }, [])
    const st = useRef(0)
    const lastSearch = useRef("")
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
        clearTimeout(st.current);
        if (findIn == 'LOCAL') setSongs(filterSongs)
        else if (lastSearch.current != search) {
            lastSearch.current = search;
            st.current = setTimeout(() => searchSongs(), 1500)
        }
    }, [search, iSongs])

    return (
        <>

            {isSearching && false ? <div className="z-1000 backdrop-blur-[6px] w-full text-shadow-[0_0_22px_#89B4FA] fixed top-0 left-0 h-full text-blue  text-[xx-large] text-center pt-[33vh]">Загрузка...</div> : <></>}

            <div className="z-2 m-auto mt-[1vh] relative flex w-full" onBlur={() => setFocused(false)}>
                <div>
                    <div onClick={() => { if (findIn == 'LOCAL') { setFindIn('YANDEX'); setSongs([]) } else { setFindIn('LOCAL'); setSongs(iSongs) } }}
                        style={{ background: (findIn == 'LOCAL' ? 'var(--color-blue)' : 'var(--color-yellow)') }}
                        className={'transition-[border-radius] hover:-translate-x-0.5 transtion-400 relative h-full p-auto flex px-1 rounded-l-2xl ' + (findIn == 'YANDEX' ? 'rounded-2xl' : '')}>
                        <SearchSVG className="text-mantle scale-80 m-auto" />
                    </div>
                </div>
                <div className='mr-6 -z-1 hover:translate-x-0.5'> <AddNewSongs className={'rounded-' + (findIn == 'LOCAL' ? 'r-2xl' : '2xl')} style={{ transform: (findIn == 'LOCAL' ? '' : 'translateX(-100%)') }} setSongs={setSongs} /> </div>

                <div className="relative w-full ">

                    <div onClick={() => searchSongs()}
                        className="rounded-2xl absolute left-0 select-none text-mantle bg-blue absolute flex text-center h-full w-auto aspect-square">
                        <SearchSVG className="m-auto scale-100" />
                    </div>

                    {search && <button onClick={() => { setSearch(''); searchSongs() }} className="rounded-2xl peer right-0 hover:bg-red select-none absolute bg-maroon h-full aspect-square text-center text-mantle"></button>}

                    <input ref={inputElRef} onFocus={() => setFocused(true)} placeholder='Поиск...' type="text"
                        className="rounded-2xl font-bold peer-hover:line-through hover:outline-2 focus:outline-2 focus:outline-mauve outline-blue outline-0 text-text pl-[12vw] xl:pl-[1.6vw] search-input w-full bg-surface0 not-placeholder-shown:bg-surface1 pt-1"
                        onChange={(e) => { setSearch(e.target.value); }} value={search} />

                </div>

                <div className='-translate-x-1/2 -z-1 hover:-translate-x-1/3 group transition-[translate,color,background] duration-200'>
                    <div onClick={() => MusicAPI.updateSongLibrary().then(() => searchSongs()).catch(e => console.error(e))}
                        className='bg-surface1 hover:bg-blue hover:text-mantle h-full text-blue w-[3vw] flex rounded-r-2xl'>
                        <UpdateSVG className="m-auto mr-2 group-active:-rotate-360 transition-[rotate] duration-200" />
                    </div>
                </div>

                <div className="search-dropdown absolute z-1 w-full mt-8">
                    {isFocused && false ?
                        <SearchDropdown dropdownData={searchSuggetions} searchFunc={searchSongs} search={search} setValue={setSearch} inputElRef={inputElRef} /> : null}
                </div>
            </div>
        </>
    )
}


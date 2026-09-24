import { useEffect, useRef, useState } from 'react'
import { CrossSVG, SearchSVG, UpdateSVG } from '../shared/svgIcons';
import { SearchDropdown } from '../shared/searchDropdown';
import type { Song } from '../entities/dataInterfaces';
import { MusicAPI } from '../entities/api';

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
    const searchSongs = async () => {
        setSearching(true)
        try {
            const songs = await MusicAPI.searchLocalSongs(search)
            setISongs(songs)
        } catch (e) { console.error('Error while /search_local fetch: ', e); }
        setSearching(false)
    }
    useEffect(() => { searchSongs() }, [])
    useEffect(() => {
        if (search) {
            let array = [...new Set(
                [...iSongs.map(song => song.title), ...iSongs.map(song => song.artist)]
            )].filter(el => el.toLowerCase().includes(search.toLowerCase().split(' ').at(-1)))
                .slice(0, 10).map(el => [...search.toLowerCase().split(' ').slice(0, -1), el].join(' '))
            setSearchSuggetions(array)
        }
        else
            setSearchSuggetions([])
        function filterSongs() {
            if (!search)
                return iSongs
            return iSongs.filter(song => [...search.toLowerCase()].every(l => song.title.toLowerCase().includes(l) || song.artist.toLowerCase().includes(l)))
        }
        setSongs(filterSongs)
    }, [search, iSongs])

    return (
        <>
            {isSearching ? <div className="z-1000 backdrop-blur-[6px] w-full text-shadow-[0_0_22px_#89B4FA] fixed top-0 left-0 h-full text-blue  text-[xx-large] text-center pt-[33vh]">Загрузка...</div> : <></>}
            <div className="z-2 m-auto mt-[1vh] relative w-fill" onBlur={() => setFocused(false)}>
                <div className="relative w-4/5 m-auto">
                    <div onClick={() => searchSongs()} className="absolute left-0 select-none text-mantle bg-blue absolute w-fit p-1 text-center"><SearchSVG /></div>
                    {search ? <SearchClearButton setSearch={() => setSearch} /> : <></>}
                    <input ref={inputElRef} onFocus={() => setFocused(true)} placeholder='Поиск...' type="text" className="font-bold peer-hover:line-through hover:outline-2 focus:outline-2 focus:outline-mauve outline-blue outline-0 text-text pl-[8vw] xl:pl-[1.5vw] search-input w-1/1 bg-surface0 not-placeholder-shown:bg-surface1" onChange={(e) => { setSearch(e.target.value); }} value={search} />
                    <div className='absolute top-0 -right-2 translate-x-[100%]'>
                        <div onClick={async () => { try { await MusicAPI.updateSongLibrary() } catch (e) { console.error('Failed to update library: ', e); } }} className='bg-blue w-min h-min p-1 text-mantle font-bold select-none opacity-80 hover:opacity-100 hover:shadow-[0_0_10px_var(--color-blue)]'><UpdateSVG /></div>
                    </div>
                </div>
                <div className="search-dropdown absolute z-1 w-full">
                    {isFocused ? <SearchDropdown dropdownData={searchSuggetions} searchFunc={searchSongs} search={search} setValue={setSearch} inputElRef={inputElRef} /> : null}
                </div>
            </div>
        </>
    )
    //󰑓
}


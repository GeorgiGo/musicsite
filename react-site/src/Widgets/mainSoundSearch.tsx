import { useEffect, useState } from 'react'
import { CrossSVG, SearchSVG, UpdateSVG } from '../shared/svgIcons';
function SearchClearButton({ setSearch }) {
    return (<button onClick={() => setSearch('')} className="peer right-0 hover:bg-red select-none absolute bg-maroon w-[1.2vw] text-center text-mantle"></button>)
}
export default function SoundSearch({ setSongs }) {
    const [search, setSearch] = useState<string>('');
    const [iSongs, setISongs] = useState<[]>([]);
    const [isFocused, setFocused] = useState<boolean>(false);
    const [focusedSuggestion, setFocusedSuggetion] = useState<number>(-1)
    const [searchSuggetions, setSearchSuggetions] = useState<string[]>([]);
    const [isSearching, setSearching] = useState<boolean>(false);
    const [isMusicOnlySearch, setMusicOnlySearch] = useState<boolean>(true);
    const API_URL = window.location.hostname
    useEffect(() => {
        if (search)
            setSearchSuggetions(['amogus', '67'])
        else
            setSearchSuggetions([])
    }, [search])
    const searchSongs = async (update = false) => {
        if (update) await fetch(`http://${API_URL}:8000/update`)
        await fetch(`http://${API_URL}:8000/search_local/?${new URLSearchParams({ search: search }).toString()}`)
            .then(r => r.json())
            .then(r => setISongs(r))
    }
    useEffect(() => { searchSongs() }, [])
    useEffect(() => {
        function filterSongs() {
            if (!search)
                return iSongs
            return iSongs.filter(song => [...search.toLowerCase()].every(l => song.title.toLowerCase().includes(l) || song.artist.toLowerCase().includes(l)))
        }
        setSongs(filterSongs)
    }, [search, iSongs])
    const searchSuggetionsControl = (e: KeyboardEvent) => {
        if (e.code == 'ArrowDown') {
            setFocusedSuggetion(prev => (prev + 1) % searchSuggetions.length);
            e.preventDefault();
        }
        else if (e.code == 'ArrowUp') {
            setFocusedSuggetion(prev => (prev - 1 + (prev < 1 ? searchSuggetions.length : 0)));
            e.preventDefault();
        }
        else if (e.code == 'Enter' && e.ctrlKey) {
            searchSongs()
            e.preventDefault()
        }
        else if (e.code == 'Enter') {
            setSearch(searchSuggetions[focusedSuggestion]);
            e.preventDefault()
        }
    }
    return (
        <>
            {isSearching ? <div className="z-1000 backdrop-blur-[6px] w-full text-shadow-[0_0_22px_#89B4FA] fixed top-0 left-0 h-full text-blue  text-[xx-large] text-center pt-[33vh]">{API_URL}</div> : <></>}
            <div className="z-2 m-auto mt-[1vh] relative w-fill" onBlur={() => setFocused(false)}>
                <div className="relative w-4/5 m-auto">
                    <div onClick={() => searchSongs()} className="absolute left-0 select-none text-mantle bg-blue absolute w-fit p-1 text-center"><SearchSVG /></div>
                    {search ? <SearchClearButton setSearch={() => setSearch} /> : <></>}
                    <input onKeyDown={(e) => searchSuggetionsControl(e)} onFocus={() => setFocused(true)} placeholder='Поиск...' type="text" className="font-bold peer-hover:line-through hover:outline-2 focus:outline-2 focus:outline-mauve outline-blue outline-0 text-text pl-[8vw] xl:pl-[1.5vw] search-input w-1/1 bg-surface0 not-placeholder-shown:bg-surface1" onChange={(e) => { setSearch(e.target.value); }} value={search} />
                    <div className='absolute top-0 -right-2 translate-x-[100%]'>
                        <span onClick={() => setMusicOnlySearch(prev => !prev)} className='bg-(--cur-color) pl-1 pr-1 mr-2 text-mantle font-bold select-none opacity-80 hover:opacity-100 hover:shadow-[0_0_10px_var(--cur-color)] hidden' style={{ '--cur-color': (!isMusicOnlySearch ? 'var(--color-maroon)' : 'var(--color-blue)') }}>{isMusicOnlySearch ? '󰎇' : 'a'}</span>
                        <div onClick={() => { searchSongs(true) }} className='bg-blue w-min h-min p-1 text-mantle font-bold select-none opacity-80 hover:opacity-100 hover:shadow-[0_0_10px_var(--color-blue)]'><UpdateSVG /></div>
                    </div>
                </div>
                {/*  temporaly removed  */}
                <div className="search-dropdown absolute z-1 w-full">
                    <div className="flex m-auto flex-col bg-base w-4/5 p-1" style={{ display: (search && isFocused && searchSuggetions.length > 0 ? 'flex' : 'none') }}>
                        {search ? searchSuggetions.map((ss, idx) => <span key={ss} className={"text-subtext0" + (focusedSuggestion == idx ? ' bg-surface0' : '')} onMouseEnter={() => setFocusedSuggetion(idx)} onMouseDown={() => setSearch(ss)}>{ss}</span>) : <></>}
                    </div>
                </div>
            </div>
        </>
    )
    //󰑓
}


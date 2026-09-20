import { useEffect, useState } from 'react'
function SearchClearButton({ setSearch }) {
    return (<button onClick={() => setSearch('')} className="peer right-0 hover:bg-red select-none absolute bg-maroon w-[1.2vw] text-center text-mantle"></button>)
}
export default function SoundSearch({ setSongs }) {
    const [search, setSearch] = useState<string>('');
    const [isFocused, setFocused] = useState<boolean>(false);
    const [focusedSuggestion, setFocusedSuggetion] = useState<number>(-1)
    const [searchSuggetions, setSearchSuggetions] = useState<string[]>([]);
    const [isSearching, setSearching] = useState<boolean>(false);
    const [isGlobalSearch, setGlobalSearch] = useState<boolean>(false);
    const [isMusicOnlySearch, setMusicOnlySearch] = useState<boolean>(true);

    useEffect(() => {
        async function get_local() {
            setSearching(true)
            await fetch(`http://127.0.0.1:8000/search_local/?${new URLSearchParams({ search: search }).toString()}`)
                .then(r => r.json())
                .then(r => setSongs(r))
            setSearching(false)
        }
        get_local()
    }, [])
    //useEffect(() => {
    //    if (search)
    //        fetch(`http://127.0.0.1:8000/suggetions/?${new URLSearchParams({ search: search }).toString()}`)
    //            .then(r => r.json())
    //            .then(d => setSearchSuggetions(d));
    //    else
    //        setSearchSuggetions([])
    //}, [search])
    const searchSongs = async (update = false) => {
        if (update) await fetch(`http://127.0.0.1:8000/update`)
        if (!isSearching && ((isGlobalSearch && search) || (!isGlobalSearch))) {
            //setSearching(true)
            if (isGlobalSearch && false)
                await fetch(`http://127.0.0.1:8000/search/?${new URLSearchParams({ search: search, music_only: isMusicOnlySearch }).toString()}`)
                    .then(r => r.json())
                    .then(r => setSongs(r))
            else
                await fetch(`http://127.0.0.1:8000/search_local/?${new URLSearchParams({ search: search }).toString()}`)
                    .then(r => r.json())
                    .then(r => setSongs(r))
            //setSearching(false)
        }
    }
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
            {isSearching ? <div className="z-1000 backdrop-blur-[6px] w-full text-shadow-[0_0_22px_#89B4FA] fixed top-0 left-0 h-full text-blue  text-[xx-large] text-center pt-[33vh]">Загрузка...</div> : <></>}
            <div className="z-2 m-auto mt-[1vh] relative w-min" onBlur={() => setFocused(false)}>
                <div className="relative w-min">
                    <span onClick={() => setGlobalSearch(prev => !prev)} className='absolute translate-x-[-120%] hover:translate-x-[calc(-120%+var(--spacing)*3)] bg-(--cur-color) pl-1 pr-1 text-mantle font-bold select-none opacity-80 hover:opacity-100 hover:pl-3 hover:pr-3 hover:shadow-[0_0_10px_var(--cur-color)]' style={{ '--cur-color': (isGlobalSearch ? 'var(--color-maroon)' : 'var(--color-blue)') }}>{isGlobalSearch ? 'global' : '_local'}</span>
                    <span onClick={() => searchSongs()} className="select-none text-mantle bg-blue absolute w-[1.2vw] text-center"></span>
                    {search ? <SearchClearButton setSearch={() => setSearch} /> : <></>}
                    <input onInput={() => searchSongs()} onKeyDown={(e) => searchSuggetionsControl(e)} onFocus={() => setFocused(true)} placeholder='Поиск...' type="text" className="font-bold peer-hover:line-through hover:outline-2 focus:outline-2 focus:outline-mauve outline-blue outline-0 text-text pl-[1.5vw] search-input w-[30vw] bg-surface0 not-placeholder-shown:bg-surface1" onChange={(e) => setSearch(e.target.value)} value={search} />
                    <div className='absolute top-0 -right-4 translate-x-[100%]'>
                        <span onClick={() => setMusicOnlySearch(prev => !prev)} className='bg-(--cur-color) pl-1 pr-1 mr-2 text-mantle font-bold select-none opacity-80 hover:opacity-100 hover:shadow-[0_0_10px_var(--cur-color)]' style={{ '--cur-color': (!isMusicOnlySearch ? 'var(--color-maroon)' : 'var(--color-blue)') }}>{isMusicOnlySearch ? '󰎇' : 'a'}</span>
                        <span onClick={() => { searchSongs(true) }} className='bg-blue pl-1 pr-1 text-mantle font-bold select-none opacity-80 hover:opacity-100 hover:shadow-[0_0_10px_var(--color-blue)]'>󰑓</span>
                    </div>
                </div>
                {/*  temporaly removed  */}
                <div className="hidden search-dropdown absolute z-1">
                    <div className="flex flex flex-col bg-base w-[30vw] p-1" style={{ display: (search && isFocused && searchSuggetions.length > 0 ? 'flex' : 'none') }}>
                        {false && search && isFocused ? searchSuggetions.map((ss, idx) => <span key={ss} className={"text-subtext0" + (focusedSuggestion == idx ? ' bg-surface0' : '')} onMouseEnter={() => setFocusedSuggetion(idx)} onMouseDown={() => setSearch(ss)}>{ss}</span>) : <></>}
                    </div>
                </div>
            </div>
        </>
    )
}

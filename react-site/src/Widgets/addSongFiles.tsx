import { useRef } from "react";
import { MusicAPI } from "../entities/api";
import { PlusSVG } from "../shared/svgIcons";

export default function AddNewSongs({ setSongs }) {
    const formRef = useRef<HTMLFormElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formRef.current) return
        const formData = new FormData(formRef.current)
        await MusicAPI.addSongFiles(formData).catch(err => console.error(err))
        inputRef.current.value = ''
        await MusicAPI.updateSongLibrary().catch(err => console.error(err));
        try {
            const songs = await MusicAPI.searchLocalSongs("")
            setSongs(songs)
        } catch (e) { console.error(e); }
    }
    return (
        <div className='relative mt-[2vh] xl:mt-[2vh] w-full h-[2.5vw]'>
            <form onSubmit={handleSubmit} action="post" ref={formRef} className="m-auto w-fit">
                <input onInput={handleSubmit} ref={inputRef} name="songs" id="addSongs" className='hover:scale-110 bg-blue p-2 transtion-all duration-200' type="file" multiple={true} accept='.mp3' />
                <button type='submit' className='hidden active:scale-80 overflow-hidden m-auto ml-2 relative bg-green p-2 pl-8 pr-8 transtion-all duration-200 group'>
                    <span className='absolute top-[-60%] left-1 group-hover:top-1 font-bold transtion-all duration-300'>добавить</span>
                    <PlusSVG className='group-hover:translate-y-2/1 scale-160 transtion-all duration-200' />
                </button>
            </form>
        </div>

    )
}

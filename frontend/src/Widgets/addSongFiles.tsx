import { useRef } from "react";
import { MusicAPI } from "../entities/api";

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
        <div className='relative w-fit '>
            <form onSubmit={handleSubmit} action="post" ref={formRef} className="w-fit">
                <label>
                    <input onInput={handleSubmit} ref={inputRef} name="songs" id="addSongs" className='sr-only' type="file" multiple={true} accept='.mp3, .m4a' />
                    <span className="hover:scale-110 bg-blue transtion-all duration-200 px-2">+ песня</span>
                </label>
            </form>
        </div>

    )
}

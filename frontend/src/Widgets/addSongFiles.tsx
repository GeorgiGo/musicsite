import { useRef, type CSSProperties, type DetailedHTMLProps, type HTMLAttributes } from "react";
import { MusicAPI } from "../entities/api";
import { MusicNewSVG, MusicSVG, PlusSVG } from "../shared/svgIcons";

export default function AddNewSongs({ style, setSongs, className }: { style: CSSProperties, setSongs: any, className: string }) {
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
        <div className='relative h-full'>
            <form onSubmit={handleSubmit} action="post" ref={formRef} className="h-full">
                <label>
                    <input onInput={handleSubmit} ref={inputRef} name="songs" id="addSongs"
                        className='sr-only' type="file" multiple={true} accept='.mp3, .m4a' />

                    <span style={style} className={"h-full bg-blue transtion-all duration-200 text-center px-1 rounded-r-2xl flex flex-row " + className}>
                        <MusicNewSVG className="text-mantle scale-100 m-auto" />
                    </span>
                </label>
            </form>
        </div>

    )
}

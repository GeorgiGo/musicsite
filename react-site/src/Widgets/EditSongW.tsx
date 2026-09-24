import { useRef } from "react";

export default function EditSong({ curEditingSong, setCurEditingSong, setEditingSong }) {
    const form = useRef(null)

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (form.current == null) return;
        const formData = new FormData(form.current);
        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/songs/${curEditingSong.video_id}`, {
                method: 'PATCH',
                body: formData
            });
            if (response.ok) {
                alert('Песня успешно обновлена!');
            } else {
                alert('Произошла ошибка при сохранении.');
            }
        } catch (error) {
            console.error('Ошибка сети:', error);
        }
        await fetch(`${import.meta.env.VITE_API_URL}/update`)
        setEditingSong(false)
    }

    return (<div onKeyDown={e => { if (e.code == 'Escape') { setEditingSong(false) } }} className="fixed flex p-2 top-1/3 left-1/2 -translate-y-1/2 -translate-x-1/2 bg-surface0 shadow-[0_0_8px_var(--color-sky)] z-3000">
        <form onSubmit={handleSubmit} method='post' ref={form} className='flex' id="songForm" encType="multipart/form-data">
            <div className="relative">
                <input onChange={e => setCurEditingSong(prev => ({ ...prev, cover_file: e.target.files[0] }))} className="w-full h-full absolute top-0 left-0" name="cover_file" type="file" accept="image/*" />
                <img className="w-[6vw] aspect-square" src={typeof curEditingSong.cover_file === 'object' ? URL.createObjectURL(curEditingSong.cover_file) : curEditingSong.cover_file} alt="" />
            </div>
            <div className="block m-auto ml-4 mr-4">
                <input name="title" className="block text-[x-large] text-text font-bold" type="text" onChange={e => setCurEditingSong(prev => ({ ...prev, title: e.target.value }))} value={curEditingSong.title} />
                <input name="artist" className="block text-[large] text-subtext0" type="text" onChange={e => setCurEditingSong(prev => ({ ...prev, artist: e.target.value }))} value={curEditingSong.artist} />
            </div>
            <button className="text-mantle text-[x-large] bg-blue w-fit h-fit p-1 pl-2 pr-2 font-bold m-auto hover:scale-120 hover:shadow-[0_0_6px_var(--color-blue)] active:scale-100" type="submit"></button>
            <button className="absolute -top-8 -right-8 text-mantle text-[large] bg-red w-fit h-fit pl-2 pr-2 font-bold m-auto hover:scale-120 hover:shadow-[0_0_6px_var(--color-blue)] active:scale-100" onClick={() => setEditingSong(false)}></button>
        </form>
    </div>)
}

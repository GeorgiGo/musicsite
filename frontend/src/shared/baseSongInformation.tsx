import type { BaseSong } from "../entities/dataInterfaces"
import { useIsMobile } from "../entities/hooks/useIsMobile"
import { MusicSVG } from "./svgIcons"

export default function CommonInformation({ duration, cover_url, title, artist }: BaseSong) {
    const isMobile = useIsMobile()
    const r = Math.floor(duration * 2 % 5)

    return (<>
        <div className='pointer-events-none relative'>
            {cover_url == "" ?
                <div className="w-[5vw] 2xl:w-[3vw] h-[5vw] 2xl:h-[3vw] flex"><MusicSVG style={{ color: ('var(--color-' + ['peach', 'blue', 'green', 'yellow', 'mauve'][r] + ')') }} className="m-auto w-2/3 h-2/3 text-blue" /></div>
                :
                <img src={cover_url == "" ? 'null' : cover_url} alt="" className="select-none rounded-[10px] w-[5vw] 2xl:w-[3vw] " />}
        </div>
        <div className='flex flex-col ml-4 pointer-events-none'>
            <span className='select-none text-text font-bold text-lg'>{title}</span>
            <span className='select-none text-subtext0 font-bold text-[medium] '>{artist}</span>
        </div>
        {isMobile ? null : <h1 className="select-none m-auto mr-0 text-center text-xl text-subtext0">{Math.floor(duration / 60)}:{(duration % 60).toString().padStart(2, '0')}</h1>}
    </>
    )
}

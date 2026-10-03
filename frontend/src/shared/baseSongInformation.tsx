import type { BaseSong } from "../entities/dataInterfaces"
import { useIsMobile } from "../entities/useIsMobile"

export default function CommonInformation({ duration, cover_url, title, artist }: BaseSong) {
    const isMobile = useIsMobile()

    return (<>
        <div className='relative'>
            <img src={cover_url == "" ? 'null' : cover_url} alt="" className="select-none rounded-[10px] w-[13vw] xl:w-[2.5vw]" />
        </div>
        <div className='flex flex-col ml-4'>
            <span className='select-none text-text font-bold'>{title}</span>
            <span className='select-none text-subtext0 font-bold text-[medium] xl:text-[small]'>{artist}</span>
        </div>
        {isMobile ? null : <h1 className="select-none m-auto mr-0 text-center text-subtext0">{Math.floor(duration / 60)}:{(duration % 60).toString().padStart(2, '0')}</h1>}
    </>
    )
}

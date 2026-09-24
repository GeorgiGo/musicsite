import { useCallback, useState } from "react";

interface ProgressBar {
    max: number;
    cur: number;
    setValue: (num: number) => void
    baseStyle: string;
    innerStyle: string;
    valuePreviewFunction: (num: number) => string
    additionalOnClick?: () => void
}
export default function ProgressBar({ max, cur, setValue, baseStyle, innerStyle, valuePreviewFunction, additionalOnClick = () => { } }: ProgressBar) {
    const [hoverX, setHoverX] = useState<number>(0);
    const [isMouseDown, setMouseDown] = useState<boolean>(false);
    const [rect, setRect] = useState<DOMRect | null>(null);

    const mainBarRef = useCallback((node: HTMLDivElement | null) => {
        if (node !== null && !rect) {
            const rect = node.getBoundingClientRect();
            setRect(rect);
        }
    }, [rect]);

    return (
        <div ref={mainBarRef} onMouseLeave={() => setMouseDown(false)} onMouseUp={() => setMouseDown(false)} onBlur={() => setMouseDown(false)} onMouseDown={() => setMouseDown(true)}
            onMouseMove={(e) => {
                setHoverX(e.clientX);
                if (isMouseDown) {
                    setValue((e.clientX - rect?.left) / rect?.width * max);
                    additionalOnClick()
                }
            }} onClick={(e) => { setValue((e.clientX - rect?.left) / rect?.width * max); additionalOnClick() }} className={"group " + baseStyle} >
            <div className={'relative transition-all duration-200 h-full ' + innerStyle} style={{ width: `${(cur / max * 100).toFixed(2)}%` }}></div>
            <h1 className='select-none -translate-x-1/2 -translate-y-2/3 group-hover:block hidden absolute text-text text-[large]' style={{ left: `${hoverX}px` }}>󰗧</h1>
            <h1 className='select-none -translate-x-1/2 translate-y-[-150%] group-hover:block hidden absolute text-text text-[medium] bg-mantle p-[2px]' style={{ left: `${hoverX}px` }}>{valuePreviewFunction((hoverX - rect?.left) / rect?.width * max)}</h1>
        </div >
    )
}

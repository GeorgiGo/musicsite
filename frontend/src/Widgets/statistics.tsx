import { useEffect, useMemo, useState } from "react";
import { useStatistics } from "../entities/StatisticsContext";
import { ChartPieSVG } from "../shared/svgIcons";
import EachSongTime from "../shared/statisticsShared/EachSongInTime";
import type { simplifiedDate, songTimeStat } from "../entities/dataInterfaces";

export function timeFromSeconds(seconds: number, useSeconds = true) {
    const h = seconds / 3600 > 1 ? `${Math.floor(seconds / 3600)}ч` : ''
    const m = Math.floor(seconds % 3600 / 60);
    const s = useSeconds ? `${Math.round(seconds % 60)}с` : '';
    return (`${h} ${m}м ${s}`)
}

export default function StatisticsField() {
    const [opened, setOpened] = useState<boolean>(false);
    const openHandle = e => {
        if (e.code == "KeyP") setOpened(p => !p)
        else if (e.code == 'Escape') setOpened(false)
    }
    useEffect(() => {
        document.addEventListener('keydown', openHandle)
        return () => {
            document.removeEventListener('keydown', openHandle)
        }
    }, []);
    return (
        <>
            <button onClick={() => setOpened(p => !p)} className="p-4 bg-blue m-4 ml-0">
                <ChartPieSVG className="scale-180" />
            </button>
            <StatisticsPanel setOpened={setOpened} opened={opened} />
        </>
    )
}
function StatisticsPanel({ setOpened, opened }) {
    return (
        <div className={`transition-opacity duration-300 z-10 w-[95vw] h-9/11 fixed top-0 left-0 m-[2.5vw] mt-4 ${opened ? 'opacity-100 visible' : 'opacity-0 pointer-events-none'}`}>
            <div
                className="h-full w-full z-10 bg-crust text-text p-8 pt-3 border-2 border-surface1 shadow-[0_0_10px_4px_var(--color-surface0)]">
                <button onClick={() => setOpened(false)} className="p-4 bg-blue absolute top-0 left-0"> <ChartPieSVG className="scale-180" /> </button>
                <h1 className="text-xl font-bold m-auto w-fit text-[x-large] text-shadow-[0_0_4px_var(--color-text)] mb-3">-- Общая статистика --</h1>
                <div className="grid grid-cols-4 gap-8">
                    <BaseInformation />
                    <EachSongTime update={opened} />
                </div>
            </div>
        </div>
    )
}
export function compareDate(date: Date, d: simplifiedDate) { return d.year == date.getFullYear() && d.month == date.getMonth() && d.day == date.getDate() }
function BaseInformation() {
    const { allTime, songTimeDict } = useStatistics()
    const TodayListen = useMemo(() => {
        const date = new Date()
        return songTimeDict.reduce((acc: number, std: songTimeStat) => acc + (std.times?.find(t => compareDate(date, t.date))?.time || 0), 0)
    }, [songTimeDict])
    const nominationColors = [
        'peach',
        'green',
        'blue',
        'text',
        'text'
    ]
    return (<div className="relative block p-4 bg-mantle">
        <Field name="Всего времени слушали: " value={allTime} metricFunc={timeFromSeconds} />
        <Field name="Сегодня слушали: " value={TodayListen} metricFunc={timeFromSeconds} />
        <Divider />
        <div>
            {songTimeDict.slice(0, 5).map((value: songTimeStat, idx: number) => <Field
                key={value.video_id}
                style={{ color: `var(--color-${nominationColors[idx]})` }}
                className="p-4 bg-base mt-0 mb-0"
                name={`${idx + 1}.${value.name}`} value={value.times.reduce((acc, v) => acc + v.time, 0)} metricFunc={timeFromSeconds} />)}
        </div>
    </div>)
}

export function Field({ name, value, metricFunc = (val) => val, className = "p-4 bg-base mt-0 mb-0 ", ...props }) {
    return (<div className={"flex items-between " + className} {...props}>
        <span>{name}</span><span className="font-bold ml-auto mr-0">{metricFunc(value)}</span>
    </div>)
}
function Divider() { return (<div className="h-1 bg-surface1 mt-0 mb-0 "></div>) }

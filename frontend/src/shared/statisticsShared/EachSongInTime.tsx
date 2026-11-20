import { useState } from "react";
import { useStatistics } from "../../entities/contexts/StatisticsContext";
import { useAudio } from "../../entities/contexts/AudioContext";
import type { dateTime, Song, songTimeStat } from "../../entities/dataInterfaces";
import Calendar from "./Calendar";
import { Field, compareDate, timeFromSeconds } from "../../Widgets/statistics";

export default function EachSongTime({ update }) {
    const [activeSong, setActiveSong] = useState<songTimeStat>(null);
    const [curDate, setCurDate] = useState<Date>(new Date());
    if (!update) return

    return (<div className="col-span-3 flex flex-row bg-mantle p-4 relative h-2/5 border-1 border-surface1 rounded-xl">
        <List curDate={curDate} setActiveSong={setActiveSong} />
        <CircleDiagram activeSong={activeSong} curDate={curDate} />
        <Calendar setNewDate={setCurDate} />
    </div>)
}

function List({ curDate, setActiveSong }: { curDate: Date, setActiveSong: (v: songTimeStat) => void }) {
    const { songTimeDict } = useStatistics()
    const { mainQueue, currentSong, setCurTrack } = useAudio()

    let useDate = curDate.getFullYear() != -1  //if year == -1, set no date, use alltime
    const songTimeDictFiltred = useDate ? songTimeDict
        .filter((std: songTimeStat) => std.times.findIndex((t: dateTime) => compareDate(curDate, t.date)) != -1) : songTimeDict
    const songTimeDictMapped = songTimeDictFiltred
        .map((sts: songTimeStat) => ({
            ...sts, times: (useDate ? sts.times.find((dt: dateTime) =>
                compareDate(curDate, dt.date)).time : sts.times.reduce((acc: number, dt: dateTime) => acc + dt.time, 0))
        }))
    if (songTimeDictFiltred.length == 0) useDate = false;  //no date, use alltime

    return (
        <div className="w-2/5 block max-h-full overflow-y-scroll scrollbar-thin scrollbar-track-crust scrollbar-thumb-surface2 pr-1">
            {songTimeDictMapped.filter((e: songTimeStat) => e.times > 30).sort((a: songTimeStat, b: songTimeStat) => b.times - a.times).map((value: songTimeStat) => <Field
                key={value.video_id}
                name={value.name}
                onMouseEnter={() => setActiveSong({ video_id: '', name: value.name, times: value.times })}
                onClick={() => { setCurTrack(mainQueue.findIndex(el => el.video_id == value.video_id), mainQueue) }}
                onMouseLeave={() => setActiveSong(null)}
                style={{
                    color: currentSong?.video_id == value.video_id ? 'var(--color-text)' : 'var(--color-subtext0)',
                    fontWeight: currentSong?.video_id == value.video_id ? 'bold' : ''
                }}
                className="lg:text-[small] border-b-[1px] border-surface0 select-none text-subtext0 hover:text-blue! hover:text-shadow-[0_0_6px_var(--color-blue)] py-1 px-1 text-[small]"
                value={value.times} metricFunc={timeFromSeconds} />)}
        </div>)
}

function CircleDiagram({ activeSong, curDate }: { curDate: Date, activeSong: songTimeStat }) {
    const { songTimeDict } = useStatistics()
    if (!songTimeDict[0]) return

    let useDate = curDate.getFullYear() != -1
    const songTimeDictFiltred = useDate ? songTimeDict.filter((std: songTimeStat) => std.times.findIndex((t: dateTime) => compareDate(curDate, t.date)) != -1) : songTimeDict
    const songTimeDictMapped = songTimeDictFiltred.map((sts: songTimeStat) => ({ ...sts, times: (useDate ? sts.times.find((dt: dateTime) => compareDate(curDate, dt.date)).time : sts.times.reduce((acc: number, dt: dateTime) => acc + dt.time, 0)) }))
    if (songTimeDictFiltred.length == 0) useDate = false;  //no date, use alltime

    const sum = songTimeDictMapped.reduce((acc: number, v: songTimeStat) => acc + v.times, 0)
    const onePercentTrhrueshold = sum * 0.015;
    const largeSongs = songTimeDictMapped.filter((song: songTimeStat) => song.times >= onePercentTrhrueshold)
    const smallSongs = songTimeDictMapped.filter((song: songTimeStat) => song.times < onePercentTrhrueshold)

    let diagramArray = [...largeSongs]
    if (smallSongs.length > 0) {
        const allSmallSongs = smallSongs.reduce((acc: number, val: songTimeStat) => acc + val.times, 0);
        diagramArray.push({ video_id: '', name: 'Другие', times: allSmallSongs })
    }
    const chartColors = ['var(--color-blue)', 'var(--color-red)', 'var(--color-peach)', 'var(--color-teal)', 'var(--color-mauve)', 'var(--color-yellow)', 'var(--color-green)', 'var(--color-maroon)', 'var(--color-lavender)', 'var(--color-pink)', 'var(--color-rosewater)'];

    const radius = 15.91549430918954; //the 2PiR with this radius = 100
    const circumference = 100;
    let accumulatedPercent = 0;

    return (
        <div className="w-3/4 h-full relative">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 45 45"
                fill="currentColor" stroke="currentColor" stroke-width="0" stroke-linecap=""
                className="m-auto aspect-square w-auto h-full">
                {
                    diagramArray.filter((e: songTimeStat) => e.times > 30).sort((a, b) => b.times - a.times).map((value, idx) => {
                        const percent = value.times / sum * 100;
                        const dashArray = `${percent} ${circumference} `;
                        const dashOffset = -accumulatedPercent;
                        accumulatedPercent += percent;
                        const isOther = activeSong ? diagramArray.findIndex(a => a.video_id == activeSong?.video_id) == -1 && idx == diagramArray.length - 1 : false
                        return (
                            <circle
                                key={idx}
                                className={"donut-segment "}
                                cx="27"
                                cy="23"
                                r={radius}
                                fill="transparent"
                                stroke={chartColors[idx % chartColors.length]}
                                strokeWidth={(activeSong?.name == value.name || isOther) ? 6 : 5}
                                strokeDasharray={dashArray}
                                strokeDashoffset={dashOffset}
                                transform="rotate(-90 25 25)" // start from 12 hours
                                style={{ strokeDasharray: dashArray, }}
                            />
                        );
                    })
                }
            </svg>
            <div className="w-2/7 text-center absolute top-1/2 left-1/2 -translate-1/2">
                <h1 className=" font-bold" style={{ fontSize: (activeSong ? 'large' : 'xx-large') }}>
                    {activeSong ? activeSong.name : `${timeFromSeconds(sum, false)} `}
                </h1>
                {activeSong && <h1 className="mt-4 text-[x-large]">
                    {timeFromSeconds(activeSong.times, false)} ({(activeSong.times / sum * 100).toFixed(1)}%)
                </h1>}
            </div>
        </div>
    )
}


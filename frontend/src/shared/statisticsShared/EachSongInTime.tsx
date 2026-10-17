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

    return (<div className="col-span-3 flex flex-row bg-mantle p-4 relative  border-2 border-surface0 rounded-xl">
        <List curDate={curDate} setActiveSong={setActiveSong} />
        <CircleDiagram activeSong={activeSong} curDate={curDate} />
        <Calendar setNewDate={setCurDate} />
    </div>)
}
function List({ curDate, setActiveSong }: { curDate: Date, setActiveSong: (v: songTimeStat) => void }) {
    const { songTimeDict } = useStatistics()
    const { mainQueue, currentSong, setCurTrack } = useAudio()

    let useDate = curDate.getFullYear() != -1  //if year == -1, set no date, use alltime
    const songTimeDictFiltred = useDate ? songTimeDict.filter((std: songTimeStat) => std.times.findIndex((t: dateTime) => compareDate(curDate, t.date)) != -1) : songTimeDict
    const songTimeDictMapped = songTimeDictFiltred.map((sts: songTimeStat) => ({ ...sts, times: (useDate ? sts.times.find((dt: dateTime) => compareDate(curDate, dt.date)).time : sts.times.reduce((acc: number, dt: dateTime) => acc + dt.time, 0)) }))
    if (songTimeDictFiltred.length == 0) useDate = false;  //no date, use alltime

    return (
        <div className="w-1/3 block max-h-[40vh] overflow-y-scroll scrollbar-thin scrollbar-track-crust scrollbar-thumb-blue">
            {songTimeDictMapped.sort((a: songTimeStat, b: songTimeStat) => b.times - a.times).map((value: songTimeStat) => <Field
                key={value.video_id}
                name={value.name}
                onMouseEnter={() => setActiveSong({ video_id: '', name: value.name, times: value.times })}
                onClick={() => { setCurTrack(mainQueue.findIndex(el => el.video_id == value.video_id), mainQueue) }}
                onMouseLeave={() => setActiveSong(null)}
                style={{ color: currentSong?.video_id == value.video_id ? 'var(--color-text)' : 'var(--color-subtext0)', fontWeight: currentSong?.video_id == value.video_id ? 'bold' : '' }}
                className="lg:text-[medium] border-b-[3px] border-base select-none text-subtext0 hover:text-blue! hover:text-shadow-[0_0_6px_var(--color-blue)] p-1 text-[small]"
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
        <div className="w-3/4">
            <svg xmlns="http://www.w3.org/2000/svg"
                width="40vh" height="auto" viewBox="0 0 50 50"
                fill="currentColor" stroke="currentColor" stroke-width="0" stroke-linecap=""
                className="m-auto">
                {
                    diagramArray.sort((a, b) => b.times - a.times).map((value, idx) => {
                        const percent = value.times / sum * 100;
                        const dashArray = `${percent} ${circumference} `;
                        const dashOffset = -accumulatedPercent;
                        accumulatedPercent += percent;
                        const isOther = activeSong ? diagramArray.findIndex(a => a.name == activeSong?.name) == -1 && idx == diagramArray.length - 1 : false
                        return (
                            <circle
                                key={idx}
                                className={"donut-segment "}
                                cx="25"
                                cy="25"
                                r={radius}
                                fill="transparent"
                                stroke={chartColors[idx % chartColors.length]}
                                strokeWidth={(activeSong?.name == value.name || isOther) ? 7 : 6}
                                strokeDasharray={dashArray}
                                strokeDashoffset={dashOffset}
                                transform="rotate(-90 25 25)" // Старт с 12 часов
                                style={{ strokeDasharray: dashArray, }}
                            />
                        );
                    })
                }
                <g style={{ pointerEvents: 'none' }}>
                    <text className="text-text font-bold"
                        x="25" y={activeSong ? "22" : "25"} // Смещаем чуть вверх, если есть вторая строка
                        dominantBaseline="central" textAnchor="middle"
                        style={{ fontSize: activeSong ? '1.5px' : '3px' }} >
                        {activeSong ? activeSong.name : `${timeFromSeconds(sum, false)} `}
                    </text>
                    {activeSong && (
                        <text className="text-subtext0 text-[2px]"
                            x="25" y="27"
                            dominantBaseline="central" textAnchor="middle" >
                            {timeFromSeconds(activeSong.times, false)} ({(activeSong.times / sum * 100).toFixed(1)}%)
                        </text>
                    )}
                </g>
            </svg>
        </div>
    )
}


import { createContext, useCallback, useContext, useEffect, useRef } from "react";
import { useLSWithTimeout } from "./useLocalStorage";
import { useAudio } from "./AudioContext";
import { MusicAPI } from "./api";
import type { songTimeStat } from "./dataInterfaces";


const StatisticsContext = createContext(null)
export function StatisticsProvider({ children }) {
    const [allTime, setAllTime] = useLSWithTimeout<number>('StatisticsAllMinutes', 10000, 0);
    const [songTimeDict, setSongTimeDict] = useLSWithTimeout<songTimeStat[]>('StatissticsSTD', 15000, []);
    useEffect(() => {
        const dofunc = async () => {
            const data = await MusicAPI.getStat().catch(err => console.error(err))
            setAllTime(JSON.parse(data.all_minutes))
            setSongTimeDict(JSON.parse(data.songTimeDate))
        }
        dofunc()
    }, [])
    const { audioRef, currentSong } = useAudio();

    const lastDate = useRef<number>(0);
    const lastUpdateTimestamp = useRef<number>(0);
    const lastAllTime = useRef<number>(0);
    const THROTTLE_LIMIT = 2000;

    const handleTimeUpdate = useCallback(e => {
        const now = Date.now()
        if (lastDate.current == 0) {
            lastDate.current = now
            lastUpdateTimestamp.current = now;
            return;
        }
        if (now - lastUpdateTimestamp.current < THROTTLE_LIMIT) return;

        const diff = ((now - lastDate.current) / 1000)
        setAllTime(prev => prev + diff)
        if (currentSong)
            setSongTimeDict(prev => {
                const idx = prev.findIndex(el => el.video_id == currentSong.video_id)

                const date = new Date()
                if (idx == -1) {
                    const simplifiedDate = { year: date.getFullYear(), month: date.getMonth(), day: date.getDate() }
                    return [...prev, {
                        name: `${currentSong.artist} - ${currentSong.title}`,
                        video_id: currentSong.video_id,
                        times: [{ time: diff, date: simplifiedDate }]
                    }].sort((a, b) => b.times.reduce((acc, v) => acc + v.time, 0) - a.times.reduce((acc, v) => acc + v.time, 0))
                }
                else {
                    const newArr = structuredClone(prev)
                    const timeIdx = newArr[idx].times.findIndex(el => el.date.year == date.getFullYear() && el.date.month == date.getMonth() && el.date.day == date.getDate())
                    newArr[idx] = {
                        ...newArr[idx],
                        name: `${currentSong.artist} - ${currentSong.title}`,
                    }
                    if (timeIdx == -1) {
                        const simplifiedDate = { year: date.getFullYear(), month: date.getMonth(), day: date.getDate() }
                        newArr[idx].times.push({ date: simplifiedDate, time: diff })
                    } else
                        newArr[idx].times[timeIdx].time += diff
                    return newArr.sort((a, b) => b.times.reduce((acc, v) => acc + v.time, 0) - a.times.reduce((acc, v) => acc + v.time, 0))
                }
            })
        lastDate.current = now
        lastUpdateTimestamp.current = now;
    }, [currentSong, songTimeDict, allTime])
    const handlePause = e => { lastDate.current = 0 }

    const fetchInterval = useRef<number>(null)
    const saveStats = () => {
        if (lastAllTime.current == allTime) return
        const toSend = { all_minutes: Math.round(allTime), songTimeDate: JSON.stringify(songTimeDict) }
        MusicAPI.putStat(toSend).catch(err => console.error(err))
        lastAllTime.current = allTime
    }
    useEffect(() => {
        audioRef.current?.addEventListener('timeupdate', handleTimeUpdate)
        audioRef.current?.addEventListener('pause', handlePause)
        fetchInterval.current = setInterval(saveStats, 60000)
        return () => {
            clearInterval(fetchInterval.current)
            audioRef.current?.removeEventListener('timeupdate', handleTimeUpdate)
            audioRef.current?.removeEventListener('pause', handlePause)
        }
    }, [currentSong])
    return (
        <StatisticsContext.Provider value={{ songTimeDict, allTime, setAllTime }}>
            {children}
        </StatisticsContext.Provider>
    )
}
export function useStatistics() { return useContext(StatisticsContext); }

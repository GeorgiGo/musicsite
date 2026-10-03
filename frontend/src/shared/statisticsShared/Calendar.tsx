import { useState } from "react";
import { ArrowRightSVG, ArrowLeftSVG } from "../svgIcons";

export default function Calendar({ setNewDate }) {
    const [opened, setOpened] = useState<boolean>(false);
    const [curYear, setYear] = useState<number>(new Date().getFullYear());
    const [curMonth, setMonth] = useState<number>(new Date().getMonth());
    const [curDay, setDay] = useState<number>(new Date().getDate());
    const [lastY, setLastY] = useState<number>(2026);
    const months = [
        'Январь',
        'Февраль',
        'Март',
        'Апрель',
        'Май',
        'Июнь',
        'Июль',
        'Август',
        'Сентябрь',
        'Октябрь',
        'Ноябрь',
        'Декабрь'
    ];
    const setDate = (e) => {
        if (e == -1) {
            setNewDate(new Date(-1, curMonth, curDay))
            return
        }
        if (curYear == -1) setYear(lastY)
        setDay(e.target.value)
        setNewDate(new Date(curYear == -1 ? lastY : curYear, curMonth, e.target.value))
    }
    const prevMonth = (e) => {
        if (curMonth == 0) {
            setMonth(11);
            setYear(p => p - 1)
        } else
            setMonth(p => p - 1);
    }
    const nextMonth = (e) => {
        if (curMonth == 11) {
            setMonth(0);
            setYear(p => p + 1)
        } else
            setMonth(p => p + 1);
    }
    const checkNowDay = (day: number) => {
        const d = new Date()
        return d.getFullYear() == curYear &&
            d.getMonth() == curMonth &&
            d.getDate() == day
    }
    return (
        <div className="absolute top-2 right-2">
            <div
                style={{ background: opened ? 'var(--color-surface0)' : 'unset' }}
                className="bg-mantle hover:bg-surface0! p-1 pr-4 pl-4 rounded-t-lg" onClick={() => setOpened(p => !p)}>
                {curYear == -1 ? <h1 className="select-none">___ Все время __</h1> :
                    <h1 className="select-none">{curDay} {months[curMonth].padStart(8, '_')} {curYear}</h1>}
            </div>
            {opened && <div className="border-surface0 border-3">
                <div className="items-center flex">
                    <button onClick={prevMonth} className="hover:scale-120 active:scale-80 duration-300 transition-scale"><ArrowLeftSVG /></button>
                    <span className="select-none m-auto">{months[curMonth]} {curYear}</span>
                    <button onClick={nextMonth} className="hover:scale-120 active:scale-80 duration-300 transition-scale"><ArrowRightSVG /></button>
                </div>
                <div className="grid grid-cols-8">
                    {Array.from({ length: new Date(curYear, curMonth + 1, 0).getDate() }, (_, idx) => idx + 1)
                        .map(day =>
                            <label key={day} className="active:text-blue">
                                <input
                                    onChange={setDate}
                                    checked={curDay == day} type="radio" name="date" className="sr-only peer"
                                    value={day} />
                                <span
                                    style={{
                                        color: checkNowDay(day) ? 'var(--color-text)' : 'var(--color-subtext1)',
                                        fontWeight: checkNowDay(day) ? 'bold' : 'unset'
                                    }}
                                    className="peer-checked:text-shadow-[0_0_3px_var(--color-blue)] peer-checked:font-bold! hover:font-bold! peer-checked:text-blue! hover:text-text!"> {day}</span>
                            </label>)}
                    <label className="col-span-8 text-center">
                        <input
                            value={-1} checked={curYear == -1}
                            onChange={() => { if (curYear > -1) setLastY(curYear); setYear(-1); setDate(-1) }}
                            type="radio" name="date"
                            className="sr-only peer" />
                        <span
                            style={{
                                color: curYear == -1 ? 'var(--color-text)' : 'var(--color-subtext1)',
                                fontWeight: curYear == -1 ? 'bold' : 'unset'
                            }}
                            className="text-subtext0 hover:text-text peer-checked:font-bold peer-checked:text-blue! select-none">все время</span>
                    </label>
                </div>
            </div>}
        </div>
    )
}

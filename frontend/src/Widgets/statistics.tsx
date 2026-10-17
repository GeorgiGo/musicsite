import { useEffect, useMemo, useRef, useState } from "react";
import { useStatistics } from "../entities/contexts/StatisticsContext";
import { ChartPieSVG, CrossSVG } from "../shared/svgIcons";
import EachSongTime from "../shared/statisticsShared/EachSongInTime";
import type { dateTime, simplifiedDate, songTimeStat } from "../entities/dataInterfaces";

export function timeFromSeconds(seconds: number, useSeconds = true) {
    const h = seconds / 3600 > 1 ? `${Math.floor(seconds / 3600)}ч` : ''
    const m = Math.floor(seconds % 3600 / 60);
    const s = useSeconds ? `${Math.round(seconds % 60)}с` : '';
    return (`${h} ${m}м ${s}`)
}

export default function StatisticsField({ curTab, setCurTab }) {
    return (
        <>
            <label className="group relative p-2 w-fit ">
                <input
                    name='tab' type="radio"
                    checked={curTab == 'STATISTICS'}
                    onChange={() => setCurTab('STATISTICS')}
                    className="sr-only peer" />
                < ChartPieSVG className='pointer-events-none text-blue' width='50px' height='50px' />
                <div className="peer-checked:h-2/3 w-2 h-0 group-hover:h-1/3 bg-surface1 absolute top-1/2 left-0 -translate-1/2"></div>
                <span className="left-full bottom-1/2 translate-y-1/2 absolute mb-0
                        pointer-events-none select-none opacity-0 scale-95 transition-all duration-200 ease-out group-hover:opacity-100 group-hover:scale-100
                        px-2 py-0.5 text-[small] font-medium text-text bg-base border border-surface0 rounded-md rounded-bl-none shadow-xl
        whitespace-nowrap pointer-events-none
 ">Статистика (P)</span>
            </label>
        </>
    )
}

export function StatisticsTab({ curTab }) {
    return (
        <div style={{ display: (curTab == 'STATISTICS' ? 'block' : 'none') }} className=''>
            <div className="h-full w-full text-text p-8 pt-3">
                <h1 className="text-xl font-bold m-auto w-fit text-[x-large] text-shadow-[0_0_4px_var(--color-text)] mb-3">-- Общая статистика --</h1>
                <div className="grid grid-cols-4 gap-8">
                    <BaseInformation />
                    <div className="col-span-3">
                        <EachSongTime update={true} />
                        <DayGraphic />
                    </div>
                </div>
            </div>
        </div>
    )
}

// Функция генерации плавного пути (Кубические сплайны Безье)
const lineCommand = (point: number[], i: number, a: number[][]) => {
    const cps = (p1, p2, p3, isEnd) => {
        const cpX = p2[0] + (p3 ? (p3[0] - p1[0]) * 0.2 : (p2[0] - p1[0]) * 0.2) * (isEnd ? -1 : 1);
        const cpY = p2[1] + (p3 ? (p3[1] - p1[1]) * 0.2 : (p2[1] - p1[1]) * 0.2) * (isEnd ? -1 : 1);
        return [cpX, cpY];
    };
    const [cp1X, cp1Y] = cps(a[i - 2] || point, a[i - 1], point, false);
    const [cp2X, cp2Y] = cps(a[i - 1], point, a[i + 1], true);
    return `C ${cp1X},${cp1Y} ${cp2X},${cp2Y} ${point[0]},${point[1]}`;
};

const svgPath = (points: number[][]) => {
    if (points.length === 0) return '';
    return points.reduce((acc, point, i, a) =>
        i === 0 ? `M ${point[0]},${point[1]}` : `${acc} ${lineCommand(point, i, a)}`, ''
    );
};

export function PremiumAreaChart({ er }) {
    const { songTimeDict } = useStatistics()
    // Используем функцию подготовки данных из предыдущего ответа
    const data = useMemo(() => transformData(songTimeDict), [songTimeDict]);
    const width = useMemo(() => er.current?.getBoundingClientRect().width | 800, [er.current]);
    const height = 500;
    const padding = { top: 40, right: 20, bottom: 40, left: 50 };

    const chartWidth = width - padding.left - padding.right;
    const chartHeight = height - padding.top - padding.bottom;
    // Расчет экстремумов
    const maxDuration = useMemo(() => Math.max(...data.map(d => d.duration), 0) || 1, [data]);
    // Вычисляем [x, y] координаты для каждой точки на графике
    const points = useMemo(() => {
        if (data.length === 0) return [];
        return data.map((item, index) => {
            const x = padding.left + (index / (data.length - 1 || 1)) * chartWidth;
            const y = padding.top + chartHeight - (item.duration / maxDuration) * chartHeight;
            return [x, y];
        });
    }, [data, chartWidth, chartHeight, maxDuration]);

    // Строим замкнутый контур для градиентной заливки под графиком
    const fillPathData = useMemo(() => {
        if (points.length === 0) return '';
        const linePath = svgPath(points);
        const firstX = points[0][0];
        const lastX = points[points.length - 1][0];
        const baseY = padding.top + chartHeight;
        return `${linePath} L ${lastX},${baseY} L ${firstX},${baseY} Z`;
    }, [points, chartHeight]);

    const strokePathData = useMemo(() => svgPath(points), [points]);
    return (
        <div style={{ background: 'var(--color-mantle)', padding: '24px', borderRadius: '12px', width: '100%', maxWidth: width }}>
            <svg viewBox={`0 0 ${width} ${height}`} style={{ width: '100%', height: 'auto', overflow: 'visible' }}>
                <defs>
                    {/* Настройка фиолетового градиента для заливки */}
                    <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#8B5CF6" stopOpacity="0.35" />
                        <stop offset="100%" stopColor="#8B5CF6" stopOpacity="0.00" />
                    </linearGradient>
                </defs>

                {/* Горизонтальная сетка (как на скриншоте) */}
                {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => {
                    const y = padding.top + chartHeight * (1 - ratio);
                    return (
                        <line key={i} x1={padding.left} y1={y} x2={width - padding.right} y2={y} stroke="var(--color-surface1)" strokeDasharray="2 2" />
                    );
                })}

                {/* 1. Градиентная область ПОД линией */}
                {points.length > 0 && (
                    <path d={fillPathData} fill="url(#chartGradient)" />
                )}

                {/* 2. Сама плавная линия графика */}
                {points.length > 0 && (
                    <path d={strokePathData} fill="none" stroke="#A78BFA" strokeWidth="3" strokeLinecap="round" />
                )}

                {/* Интерактивные точки при наведении */}
                {points.map((pt, i) => (
                    <g key={i} className="chart-node" style={{ cursor: 'pointer' }}>
                        {/* Невидимая большая область для легкого наведения мыши */}
                        <circle cx={pt[0]} cy={pt[1]} r="12" fill="transparent" />
                        {/* Маленькая светящаяся точка */}
                        <circle cx={pt[0]} cy={pt[1]} r="4" fill="#A78BFA" className="node-dot" />

                        {/* Тултип (всплывает при наведении) */}
                        <g className="chart-tooltip">
                            <text x={pt[0]} y={pt[1] - 16} textAnchor="middle" fill="#F3F4F6" fontSize="1.2rem" fontWeight="500">
                                {timeFromSeconds(data[i].duration)}
                            </text>
                        </g>
                    </g>
                ))}

                {/* Подписи дат по оси X */}
                {data.map((item, i) => {
                    if (data.length > 10 && i % 2 !== 0) return null; // Скрываем лишние даты, если их слишком много
                    const x = padding.left + (i / (data.length - 1 || 1)) * chartWidth;
                    return (
                        <text key={i} x={x} y={height - 10} textAnchor="middle" fill="#6B7280" fontSize="11">
                            {item.dateStr}
                        </text>
                    );
                })}
            </svg>

            <style>{`
        .chart-tooltip { display: none; }
        .chart-node:hover .chart-tooltip { display: block; }
        .node-dot { transition: r 0.2s ease, fill 0.2s ease; }
        .chart-node:hover .node-dot { r: 6; fill: #FFF; }
      `}</style>
        </div>
    );
}
const transformData = (songsArray: songTimeStat[]) => {
    const dailyMap = {};
    songsArray.forEach(songItem => {
        songItem.times.forEach(entry => {
            const { year, month, day } = entry.date;
            const dateKey = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            dailyMap[dateKey] = (dailyMap[dateKey] || 0) + entry.time;
        });
    });

    const dates = Object.keys(dailyMap).sort((a, b) => new Date(a) - new Date(b));
    if (dates.length === 0) return [];

    // Заполняем пропущенные дни нулями для красивого шага сетки
    const result = [];
    const start = new Date(dates[0]);
    const end = new Date(dates[dates.length - 1]);

    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
        const key = d.toISOString().split('T')[0];
        const [year, month, day] = key.split('-');
        result.push({
            dateStr: `${day}.${month}`, // Компактный формат для оси X (например, "03.08")
            fullDate: key,
            duration: dailyMap[key] || 0
        });
    }
    return result;
};
function DayGraphic() {
    const elRef = useRef<HTMLDivElement>(null);
    return (
        <div ref={elRef} className="p-0 border border-surface0 rounded-2xl">
            <PremiumAreaChart er={elRef} />
        </div>
    )
}
export function compareDate(date: Date, d: simplifiedDate) { return d.year == date.getFullYear() && d.month == date.getMonth() && d.day == date.getDate() }
function BaseInformation() {
    const { songTimeDict } = useStatistics()
    const TodayListen = useMemo(() => {
        const date = new Date()
        return songTimeDict.reduce((acc: number, std: songTimeStat) => acc + (std.times?.find(t => compareDate(date, t.date))?.time || 0), 0)
    }, [songTimeDict])
    const AllTime = useMemo(() => {
        return songTimeDict.reduce((acc: number, std: songTimeStat) => acc + (std.times?.reduce((times: number, time: dateTime) => times + time.time, 0) || 0), 0)
    }, [songTimeDict])
    const nominationColors = [
        'peach',
        'green',
        'blue',
        'text',
        'text'
    ]
    return (<div className="relative block p-4 bg-mantle border-2 border-surface0 rounded-xl">
        <Field className="p-4 bg-base lg:text-[large]" name="Всего времени слушали: " value={AllTime} metricFunc={timeFromSeconds} />
        <Field className="p-4 bg-base lg:text-[large]" name="Сегодня слушали: " value={TodayListen} metricFunc={timeFromSeconds} />
        <Divider />
        <div>
            {songTimeDict.slice(0, 5).map((value: songTimeStat, idx: number) => <Field
                key={value.video_id}
                style={{ color: `var(--color-${nominationColors[idx]})` }}
                className="p-4 bg-base mt-0 mb-0 "
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

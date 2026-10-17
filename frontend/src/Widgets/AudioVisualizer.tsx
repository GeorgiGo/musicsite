import React, { useRef, useState, useEffect } from 'react';
import { useAudio } from '../entities/contexts/AudioContext';

export default function AudioVisualizer({ isShow }) {
    const { audioSourceRef, audioRef } = useAudio();
    const audioContextRef = useRef(null);
    const analyserRef = useRef(null);
    const dataArrayRef = useRef(null);
    const animationRef = useRef(null);

    // Состояние для хранения высот колонок (например, 16 колонок)
    const [heights, setHeights] = useState(new Array(16).fill(10));

    const canvasRef = useRef<HTMLCanvasElement>(null);
    const startVisualizer = () => {
        // Инициализируем Web Audio API при первом воспроизведении
        if (!audioContextRef.current) {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            const audioContext = new AudioContext();
            const analyser = audioContext.createAnalyser();

            // Настройка анализатора (fftSize определяет детализацию, должно быть степенью двойки)
            let source;
            if (audioSourceRef.current)
                source = audioSourceRef.current
            else {
                source = audioContext.createMediaElementSource(audioRef.current)
                audioSourceRef.current = source;
            }
            analyser.fftSize = 64; // 32 частотных диапазона
            const bufferLength = analyser.frequencyBinCount;
            const dataArray = new Uint8Array(bufferLength);

            // Подключаем аудио к анализатору и к выходу (динамикам)
            source.connect(analyser);
            analyser.connect(audioContext.destination);

            audioContextRef.current = audioContext;
            analyserRef.current = analyser;
            dataArrayRef.current = dataArray;
        }
        // Запускаем цикл анимации
        const updateAnimation = () => {
            if (analyserRef.current && dataArrayRef.current) {
                analyserRef.current.getByteFrequencyData(dataArrayRef.current);
                // Превращаем массив частот в массив высот для колонок (берём первые 16 частот)
                const newHeights = Array.from(dataArrayRef.current).map(
                    (value) => Math.max(10, (value / 255) * (window.innerHeight * 0.6)))
                setHeights(newHeights);
            }
            animationRef.current = requestAnimationFrame(updateAnimation);
        };

        updateAnimation();
    };

    const stopVisualizer = () => {
        cancelAnimationFrame(animationRef.current);
    };

    // Очистка анимации при размонтировании компонента
    useEffect(() => {
        const player = audioRef.current;
        if (!player) return;
        audioRef.current.addEventListener('play', startVisualizer)
        audioRef.current.addEventListener('pause', stopVisualizer)
        audioRef.current.addEventListener('ended', stopVisualizer)
        return () => {
            audioRef.current?.removeEventListener('play', startVisualizer)
            audioRef.current?.removeEventListener('pause', stopVisualizer)
            audioRef.current?.removeEventListener('ended', stopVisualizer)
            cancelAnimationFrame(animationRef.current)
        };
    }, []);

    return (
        <>
            {isShow ?
                <div className="top-0 left-0 fixed flex flex-row items-center opacity-80 blur-[0px] -z-1">
                    <canvas ref={canvasRef} className='w-full h-[90vh]' />
                    < div className='hidden flex items-end gap-[2px] h-[90vh] w-full rounded-[8px]' >
                        {
                            heights.toReversed().map((height, index) => (
                                <div
                                    key={index}
                                    className='flex-1'
                                    style={{
                                        height: `${height}px`,
                                        width: `${window.innerWidth / 64 - 2}px`,
                                        backgroundColor: `hsl(${(index * 360) / heights.length}, 80%, 60%)`, // Разные цвета для колонок
                                        borderRadius: '3px 3px 0 0',
                                        transition: 'height 0.05s ease', // Сглаживание прыжков
                                    }}
                                />
                            ))
                        }
                    </div >
                    <div className='hidden flex items-end gap-[4px] h-[90vh] w-full rounded-[8px]'>
                        {heights.map((height, index) => (
                            <div
                                key={index}
                                className='flex-1'
                                style={{
                                    height: `${height}px`,
                                    width: `${window.innerWidth / 64 - 2}px`,
                                    backgroundColor: `hsl(${((heights.length - index) * 360) / heights.length}, 80%, 60%)`, // Разные цвета для колонок
                                    borderRadius: '3px 3px 0 0',
                                    transition: 'height 0.05s ease', // Сглаживание прыжков
                                }}
                            />
                        ))}
                    </div>
                </div > : <></>
            }</>
    );
};


export function AudioVisualizerO({ isShow }) {
    const { audioSourceRef, audioRef } = useAudio();
    const audioContextRef = useRef(null);
    const analyserRef = useRef(null);
    const dataArrayRef = useRef(null);
    const animationRef = useRef(null);

    const canvasRef = useRef<HTMLCanvasElement>(null);
    const isShowRef = useRef<boolean>(isShow)
    const startVisualizer = () => {
        // Инициализируем Web Audio API при первом воспроизведении
        if (!audioContextRef.current) {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            const audioContext = new AudioContext();
            const analyser = audioContext.createAnalyser();

            // Настройка анализатора (fftSize определяет детализацию, должно быть степенью двойки)
            let source;
            if (audioSourceRef.current)
                source = audioSourceRef.current
            else {
                source = audioContext.createMediaElementSource(audioRef.current)
                audioSourceRef.current = source;
            }
            analyser.fftSize = 64; // 32 частотных диапазона
            const bufferLength = analyser.frequencyBinCount;
            const dataArray = new Uint8Array(bufferLength);

            // Подключаем аудио к анализатору и к выходу (динамикам)
            source.connect(analyser);
            analyser.connect(audioContext.destination);

            audioContextRef.current = audioContext;
            analyserRef.current = analyser;
            dataArrayRef.current = dataArray;
        }
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Запускаем цикл анимации
        // Функция отрисовки одного кадра анимации
        const draw = () => {
            if (!isShowRef.current) return
            // Запускаем бесконечный цикл синхронно с обновлением монитора (Герцовкой экрана)
            animationRef.current = requestAnimationFrame(draw);

            const width = canvas.width;
            const height = canvas.height;

            // 1. Считываем свежие частоты из Web Audio API в наш массив
            analyserRef.current.getByteFrequencyData(dataArrayRef.current);

            // 2. Полностью очищаем холст перед каждым новым кадром
            ctx.clearRect(0, 0, width, height);

            // Расчет геометрии столбиков
            const barWidth = (width / dataArrayRef.current.length) * 0.45;
            const barSpacing = (width / dataArrayRef.current.length) * 0.05;
            let x = 0;
            for (let i = 0; i < dataArrayRef.current.length; i++) {
                // Переводим значение частоты (0-255) в высоту в пикселях
                const percent = dataArrayRef.current[i] / 255;
                const barHeight = height * percent;

                // Задаем красивый цвет из твоей палитры (например, фиолетово-синий градиент или цвет Catppuccin)
                ctx.fillStyle = `hsl(${((dataArrayRef.current.length - i) * 360) / dataArrayRef.current.length}, 80%, 60%)`; // Подмешиваем прозрачность от мощности баса
                // Рисуем прямоугольник: координаты X, Y (снизу вверх), Ширина, Высота
                ctx.fillRect(
                    x + width / 2,
                    height - barHeight, // Чтобы столбики росли СНИЗУ ВВЕРХ
                    barWidth,
                    barHeight
                );
                x += barWidth + barSpacing;
            }
            x = 0;
            for (let i = dataArrayRef.current.length - 1; i > -1; i--) {
                // Переводим значение частоты (0-255) в высоту в пикселях
                const percent = dataArrayRef.current[i] / 255;
                const barHeight = height * percent;

                // Задаем красивый цвет из твоей палитры (например, фиолетово-синий градиент или цвет Catppuccin)
                ctx.fillStyle = `hsl(${((dataArrayRef.current.length - (dataArrayRef.current.length - i)) * 360) / dataArrayRef.current.length}, 80%, 60%)`; // Подмешиваем прозрачность от мощности баса
                // Рисуем прямоугольник: координаты X, Y (снизу вверх), Ширина, Высота
                ctx.fillRect(
                    x,
                    height - barHeight, // Чтобы столбики росли СНИЗУ ВВЕРХ
                    barWidth,
                    barHeight
                );
                x += barWidth + barSpacing;
            }
        };
        // Стартуем цикл анимации
        draw();
    };
    const stopVisualizer = () => { cancelAnimationFrame(animationRef.current); };
    useEffect(() => {
        isShowRef.current = isShow
        if (isShow) {
            startVisualizer()
        } else {
            stopVisualizer()
        }
    }, [isShow]);

    // Очистка анимации при размонтировании компонента
    useEffect(() => {
        const player = audioRef.current;
        if (!player) return;
        audioRef.current.addEventListener('play', startVisualizer)
        audioRef.current.addEventListener('pause', stopVisualizer)
        audioRef.current.addEventListener('ended', stopVisualizer)
        return () => {
            audioRef.current?.removeEventListener('play', startVisualizer)
            audioRef.current?.removeEventListener('pause', stopVisualizer)
            audioRef.current?.removeEventListener('ended', stopVisualizer)
            cancelAnimationFrame(animationRef.current)
        };
    }, []);

    return (
        <div className="top-0 left-0 fixed flex flex-row items-center opacity-80 blur-[0px] -z-1">
            <canvas ref={canvasRef} width={1200} height={400} className="w-full h-[70vh] mt-[20vh]" />
        </div>
    );
}

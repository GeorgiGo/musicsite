import React, { useRef, useState, useEffect } from 'react';
import { useAudio } from '../entities/AudioContext';

export default function AudioVisualizer() {
    const { audioSourceRef, audioRef } = useAudio();
    const audioContextRef = useRef(null);
    const analyserRef = useRef(null);
    const dataArrayRef = useRef(null);
    const animationRef = useRef(null);
    const [focused, setFocused] = useState<boolean>(true);

    // Состояние для хранения высот колонок (например, 16 колонок)
    const [heights, setHeights] = useState(new Array(16).fill(10));
    const [isPlaying, setIsPlaying] = useState(false);

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
                    (value) => Math.max(10, (value / 255) * (window.innerHeight * 0.6)))// Переводим в пиксели от 10px до 150px
                setHeights(newHeights);
            }
            animationRef.current = requestAnimationFrame(updateAnimation);
        };

        updateAnimation();
        setIsPlaying(true);
    };

    const stopVisualizer = () => {
        cancelAnimationFrame(animationRef.current);
        setIsPlaying(false);
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
        <div className="top-0 left-0 fixed flex flex-row items-center opacity-80 blur-[0px]">
            <div className='flex items-end gap-[2px] h-[90vh] w-full rounded-[8px]'>
                {heights.toReversed().map((height, index) => (
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
                ))}
            </div>
            <div className='flex items-end gap-[4px] h-[90vh] w-full rounded-[8px]'>
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
        </div >
    );
};



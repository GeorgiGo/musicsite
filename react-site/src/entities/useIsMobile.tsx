import { useState, useEffect } from 'react';

/**
 * returns `true` if on mobile 
 * @param breakpoint if window width < this value, returns true
 */
export function useIsMobile(breakpoint = 768) {
    const [isMobile, setIsMobile] = useState(() =>
        typeof window !== 'undefined' ? window.innerWidth < breakpoint : false
    );

    useEffect(() => {
        // Функция, которая будет срабатывать при изменении размера экрана
        const handleResize = () => {
            setIsMobile(window.innerWidth < breakpoint);
        };

        // Вешаем слушатель события
        window.addEventListener('resize', handleResize);

        // Удаляем слушатель при размонтировании компонента (очистка памяти)
        return () => window.removeEventListener('resize', handleResize);
    }, [breakpoint]);

    return isMobile;
}

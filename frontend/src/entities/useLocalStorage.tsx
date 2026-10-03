import { useEffect, useRef, useState } from "react";

/**
 * Returns a value and a function to update it.
 * Value also stored in `localStorage` under a given `key`.
 * @param key The key to save in localStorage.
 * @param initialValue The initialValue to set if localStorage dosn't contain value.
 */
export default function useLocalStorage<T>(key: string, initialValue: T) {
    const [value, setValue] = useState<T>(() => {
        try {
            const saved = localStorage.getItem(key);
            return saved ? JSON.parse(saved) : initialValue
        } catch {
            return initialValue
        }
    });
    useEffect(() => {
        try {
            localStorage.setItem(key, JSON.stringify(value))
        } catch (err) {
            console.error("ошибка записи в localStorage: ", err)
        }
    }, [key, value])
    return [value, setValue] as const
}
/**
 * Returns a value and a function to update it.
 * Value also stored in `localStorage` under a given `key`.
 * @param key The key to save in localStorage.
 * @param timeout the time in `ms` betwen updates in `localStorage`
 * @param initialValue The initialValue to set if localStorage dosn't contain value.
 */
export function useLSWithTimeout<T>(key: string, timeout: number, initialValue: T) {
    const [value, setValue] = useState<T>(() => {
        try {
            const saved = localStorage.getItem(key);
            return saved ? JSON.parse(saved) : initialValue
        } catch {
            return initialValue
        }
    });
    const last = useRef<number>(0);
    useEffect(() => {
        const handleSave = () => {
            try {
                localStorage.setItem(key, JSON.stringify(value));
            } catch (err) {
                console.error("Не удалось сохранить данные при закрытии вкладки:", err);
            }
        };
        const now = Date.now()
        if (now - last.current >= timeout) {
            last.current = now
            handleSave()
        }
        //window.addEventListener('beforeunload', handleSave);
        return () => window.removeEventListener('beforeunload', handleSave);
    }, [key, value])
    return [value, setValue] as const
}

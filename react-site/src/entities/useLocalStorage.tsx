import { useEffect, useState } from "react";

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

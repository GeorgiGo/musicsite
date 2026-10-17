import { createContext, useContext } from "react";
import useLocalStorage from "../hooks/useLocalStorage";

type VisualizerShowModes = 'SHOW' | 'ALWAYS' | 'NEVER'

const SettingsContext = createContext(null)
export function SettingsProvider({ children }) {
    const [showVisualizer, setShowVizualizer] = useLocalStorage<VisualizerShowModes>('showVisualiser', 'SHOW')

    return (
        <SettingsContext.Provider value={{ showVisualizer, setShowVizualizer }}>
            {children}
        </SettingsContext.Provider>
    )
}
export function useSettings() { return useContext(SettingsContext); }

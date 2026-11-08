import { createContext, useContext } from "react";
import useLocalStorage from "../hooks/useLocalStorage";

type VisualizerShowModes = 'SHOW' | 'ALWAYS' | 'NEVER'
type SongListHideModes = 'OPACTIY' | 'HIDE' | 'SHOW'

const SettingsContext = createContext(null)
export function SettingsProvider({ children }) {
    const [showVisualizer, setShowVizualizer] = useLocalStorage<VisualizerShowModes>('showVisualiser', 'SHOW')
    const [hideSongList, setHideSongList] = useLocalStorage<SongListHideModes>('hideSongList', 'OPACTIY')

    return (
        <SettingsContext.Provider value={{ showVisualizer, setShowVizualizer, hideSongList, setHideSongList }}>
            {children}
        </SettingsContext.Provider>
    )
}
export function useSettings() { return useContext(SettingsContext); }

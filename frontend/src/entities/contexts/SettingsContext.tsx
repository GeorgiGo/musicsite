import { createContext, useContext } from "react";
import useLocalStorage from "../hooks/useLocalStorage";

type VisualizerShowModes = 'SHOW' | 'ALWAYS' | 'NEVER'
type SongListHideModes = 'OPACTIY' | 'HIDE' | 'SHOW'

const SettingsContext = createContext(null)
export function SettingsProvider({ children }) {
    const [showVisualizer, setShowVizualizer] = useLocalStorage<VisualizerShowModes>('showVisualiser', 'SHOW')
    const [hideSongList, setHideSongList] = useLocalStorage<SongListHideModes>('hideSongList', 'OPACTIY')
    const [showCoverOnBack, setShowCoverOnBack] = useLocalStorage<boolean>('showCoverOnBack', false);
    const [scrollToSong, setScrollToSong] = useLocalStorage<boolean>('scrollToSong', false);

    return (
        <SettingsContext.Provider
            value={{ showVisualizer, showCoverOnBack, setShowCoverOnBack, setShowVizualizer, hideSongList, setHideSongList, scrollToSong, setScrollToSong }}>
            {children}
        </SettingsContext.Provider>
    )
}
export function useSettings() { return useContext(SettingsContext); }

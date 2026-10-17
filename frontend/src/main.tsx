import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import { AudioProvider } from './entities/contexts/AudioContext.tsx'
import { StatisticsProvider } from './entities/contexts/StatisticsContext.tsx'
import { SettingsProvider } from './entities/contexts/SettingsContext.tsx'

createRoot(document.getElementById('root')!).render(
    <StrictMode>
        <SettingsProvider>
            <AudioProvider>
                <StatisticsProvider>
                    <App />
                </StatisticsProvider>
            </AudioProvider>
        </SettingsProvider>
    </StrictMode>,
)

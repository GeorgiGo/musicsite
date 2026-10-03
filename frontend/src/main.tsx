import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import { AudioProvider } from './entities/AudioContext.tsx'
import { StatisticsProvider } from './entities/StatisticsContext.tsx'

createRoot(document.getElementById('root')!).render(
    <StrictMode>
        <AudioProvider>
            <StatisticsProvider>
                <App />
            </StatisticsProvider>
        </AudioProvider>
    </StrictMode>,
)

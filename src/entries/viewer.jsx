import React from 'react';
import ReactDOM from 'react-dom/client';
import { HelmetProvider } from 'react-helmet-async';
import { ThemeProvider } from '../contexts/ThemeContext.jsx';
import { AudioProvider } from '../contexts/AudioContext.jsx';
import { MusicNotesProvider } from '../contexts/MusicNotesContext.jsx';
import Viewer from '../pages/Viewer.jsx';
import '../styles/variables.css';
import '../styles/animations.css';
import '../styles/shell.css';
import '../styles/pages/webrtc-live.css';

ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
        <HelmetProvider>
            <ThemeProvider>
                <AudioProvider>
                    <MusicNotesProvider>
                        <Viewer />
                    </MusicNotesProvider>
                </AudioProvider>
            </ThemeProvider>
        </HelmetProvider>
    </React.StrictMode>
);

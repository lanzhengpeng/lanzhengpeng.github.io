import React from 'react';
import ReactDOM from 'react-dom/client';
import { HelmetProvider } from 'react-helmet-async';
import { ThemeProvider } from '../contexts/ThemeContext.jsx';
import { LanguageProvider } from '../contexts/LanguageContext.jsx';
import { AudioProvider } from '../contexts/AudioContext.jsx';
import { MusicNotesProvider } from '../contexts/MusicNotesContext.jsx';
import Home from '../pages/Home.jsx';
import '../styles/variables.css';
import '../styles/animations.css';
import '../styles/shell.css';
import '../styles/pages/home.css';

ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
        <HelmetProvider>
            <ThemeProvider>
                <LanguageProvider>
                    <AudioProvider>
                        <MusicNotesProvider>
                            <Home />
                        </MusicNotesProvider>
                    </AudioProvider>
                </LanguageProvider>
            </ThemeProvider>
        </HelmetProvider>
    </React.StrictMode>
);

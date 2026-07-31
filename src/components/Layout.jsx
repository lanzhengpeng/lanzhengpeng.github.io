import { useEffect } from 'react';
import ThemeSwitch from './ThemeSwitch.jsx';
import MusicControl from './MusicControl.jsx';
import BackgroundCanvas from './BackgroundCanvas.jsx';
import BoidsCanvas from './BoidsCanvas.jsx';

export default function Layout({ route, showMusicControl = true, children }) {
    useEffect(() => {
        document.body.dataset.route = route;
    }, [route]);

    return (
        <>
            <BackgroundCanvas />
            <BoidsCanvas />
            <ThemeSwitch />
            {showMusicControl && <MusicControl />}
            {children}
        </>
    );
}

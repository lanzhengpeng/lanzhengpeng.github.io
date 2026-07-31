import { createContext, useContext, useRef } from 'react';

const MusicNotesContext = createContext(null);

export function MusicNotesProvider({ children }) {
    const notesRef = useRef([]);

    return (
        <MusicNotesContext.Provider value={notesRef}>
            {children}
        </MusicNotesContext.Provider>
    );
}

export function useMusicNotes() {
    return useContext(MusicNotesContext);
}

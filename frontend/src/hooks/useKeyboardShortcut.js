// frontend/src/hooks/useKeyboardShortcut.js
import { useEffect } from 'react';

export function useKeyboardShortcut(key, callback, options = {}) {
    const { ctrl = false, shift = false, alt = false } = options;

    useEffect(() => {
        const handleKeyDown = (event) => {
            const matchesModifiers =
                event.ctrlKey === ctrl &&
                event.shiftKey === shift &&
                event.altKey === alt;

            const matchesKey = event.key.toLowerCase() === key.toLowerCase();

            if (matchesModifiers && matchesKey) {
                event.preventDefault();
                callback(event);
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [key, callback, ctrl, shift, alt]);
}

export function useKeyboardShortcuts(shortcuts) {
    useEffect(() => {
        const handleKeyDown = (event) => {
            for (const shortcut of shortcuts) {
                const { key, ctrl = false, shift = false, alt = false, callback } = shortcut;

                const matchesModifiers =
                    event.ctrlKey === ctrl &&
                    event.shiftKey === shift &&
                    event.altKey === alt;

                const matchesKey = event.key.toLowerCase() === key.toLowerCase();

                if (matchesModifiers && matchesKey) {
                    event.preventDefault();
                    callback(event);
                    break;
                }
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [shortcuts]);
}

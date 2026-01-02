// frontend/src/components/PageTransition.jsx
import React from 'react';

export default function PageTransition({ children, isActive }) {
    return (
        <div
            style={{
                animation: isActive ? 'fadeIn 0.3s ease-in' : 'none',
                opacity: isActive ? 1 : 0,
                transition: 'opacity 0.3s ease-in-out'
            }}
        >
            {children}
        </div>
    );
}

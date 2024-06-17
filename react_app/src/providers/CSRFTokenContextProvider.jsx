import React, { createContext, useContext, useEffect, useState } from 'react';

// Create a context for CSRF token
const CSRFTokenContext = createContext();

// Custom hook to use CSRF token context
export const useCSRFToken = () => {
    return useContext(CSRFTokenContext);
};

// Provider component to manage CSRF token
export const CSRFTokenProvider = ({ children }) => {
    const [csrfToken, setCsrfToken] = useState(null);

    useEffect(() => {
        const token = getCsrfToken();
        setCsrfToken(token);
    }, []);

    const getCsrfToken = () => {
        let cookieValue = null;
        if (document.cookie && document.cookie !== '') {
            const cookies = document.cookie.split(';');
            for (let i = 0; i < cookies.length; i++) {
                const cookie = cookies[i].trim();
                if (cookie.substring(0, 10) === 'csrftoken=') {
                    cookieValue = decodeURIComponent(cookie.substring(10));
                    break;
                }
            }
        }
        return cookieValue;
    };

    return (
        <CSRFTokenContext.Provider value={csrfToken}>
            {children}
        </CSRFTokenContext.Provider>
    );
};

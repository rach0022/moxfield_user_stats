import React, { createContext, useState, useContext } from 'react';

const SelectedEDHDeck = createContext();

export const useSelectedEDHDeck = () => useContext(SelectedEDHDeck);

export const SelectedEDHDeckProvider = ({ children }) => {
    const [selectedDeck, setSelectedDeck] = useState(null);

    const setSelectedEDHDeck = (deck) => {
        setSelectedDeck(deck);
    };

    const clearSelectedEDHDeck = () => {
        setSelectedDeck(null);
    };

    return (
        <SelectedEDHDeck.Provider value={{ selectedDeck, setSelectedEDHDeck, clearSelectedEDHDeck }}>
            {children}
        </SelectedEDHDeck.Provider>
    );
};

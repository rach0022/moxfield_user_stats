import React, { createContext, useState, useContext } from 'react';

const SelectedMoxfieldUserContext = createContext();

export const useSelectedMoxfieldUser = () => useContext(SelectedMoxfieldUserContext);

export const SelectedMoxfieldUserProvider = ({ children }) => {
    const [selectedUser, setSelectedUser] = useState(null);

    const setSelectedMoxfieldUser = (user) => {
        setSelectedUser(user);
    };

    const clearSelectedMoxfieldUser = () => {
        setSelectedUser(null);
    };

    return (
        <SelectedMoxfieldUserContext.Provider
            value={{ selectedUser, setSelectedMoxfieldUser, clearSelectedMoxfieldUser }}
        >
            {children}
        </SelectedMoxfieldUserContext.Provider>
    );
};

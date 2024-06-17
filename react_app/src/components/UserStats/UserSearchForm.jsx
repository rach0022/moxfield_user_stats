import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { search } from '../../redux/actions/searchActions';
import { useCSRFToken } from "../../providers/CSRFTokenContextProvider";
import { useSelectedMoxfieldUser } from '../../providers/SelectedMoxfieldUserContextProvider.jsx';
import EDHDeckList from "./EDHDeckList";

export default function UserSearchForm({}) {
    // state variables to store user options
    const [userName, setUserName] = useState('');
    const [includeLandsValue, setIncludeLandsValue] = useState(false);

    // get the csrfToken from the context provider to be used in the request to the django web server
    const csrfToken = useCSRFToken();

    // to set the selectedUser and selectedEDHDeck
    const { setSelectedMoxfieldUser, selectedUser } = useSelectedMoxfieldUser();

    const dispatch = useDispatch();
    const { loading, data, error } = useSelector((state) => state.search);

    const handleSearch = () => {
        // Dispatch search action with the username from moxfield and if they are including lands in stats
        dispatch(search(userName, includeLandsValue, csrfToken));
    };

    // UseEffect hook to set the selected user when the request is completed
    useEffect(() => {
        setSelectedMoxfieldUser((data) ? { ...data['moxfield_user'], topTenCards: data['top_ten_cards'] } : {});
    }, [data]);

    return (
        <>
            <label className={'label'}>
                Moxfield Username
            </label>
            <div className={'field has-addons'}>
                <div className={'control is-expanded'}>
                    <input
                        type="text"
                        className={'input'}
                        value={userName}
                        onChange={(e) => setUserName(e.target.value)}
                        placeholder="Search by Moxfield Username"
                        onKeyDown={(event) => {
                            if (event.key === "Enter") {
                                setUserName(event.currentTarget.value);
                                handleSearch();
                            }
                        }}
                    />
                </div>
                <div className={'control'}>
                    <button
                        className={`button is-info ${(loading) ? 'is-loading' : ''}`}
                        disabled={loading}
                        onClick={handleSearch}
                    >
                        Search
                    </button>
                </div>
            </div>

            <label className={'checkbox'}>
                <input
                    type="checkbox"
                    checked={includeLandsValue}
                    onChange={(e) => setIncludeLandsValue(e.target.checked)}
                />
                Include Lands
            </label>
            {error && <p style={{ color: 'red' }}>{error}</p>}
            {
                (selectedUser?.edh_decks)
                    ? (<EDHDeckList decks={selectedUser['edh_decks']} />)
                    : null
            }
            {
                (selectedUser?.topTenCards)
                    ? (<EDHDeckList decks={selectedUser['topTenCards']} isCardList={true} />)
                    : null
            }
        </>
    );
};

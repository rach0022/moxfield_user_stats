import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { search } from '../../redux/actions/searchActions';
import { useCSRFToken } from "../../providers/CSRFTokenContextProvider";
import { useSelectedMoxfieldUser } from '../../providers/SelectedMoxfieldUserContextProvider.jsx';
import EDHDeckList from "./EDHDeckList";
import BulmaNotification from "../Bulma/BulmaNotification";
import TopTenCardsInPotentialCombosList from './TopTenCardsInPotentialCombosList.jsx';

/**
 * UserSearchForm component handles searching for a Moxfield user and displaying their EDH decks and statistics.
 *
 * @component
 * @param {Object} props - React props object (currently no props are passed).
 * @returns {JSX.Element} - Returns JSX for rendering the user search form and displaying user data.
 */
export default function UserSearchForm({}) {
    // state variables to store user options
    const [userName, setUserName] = useState('');
    const [includeLandsValue, setIncludeLandsValue] = useState(false);

    // get the csrfToken from the context provider to be used in the request to the Django web server
    const csrfToken = useCSRFToken();

    // to set the selectedUser and selectedEDHDeck
    const { setSelectedMoxfieldUser, selectedUser } = useSelectedMoxfieldUser();

    const dispatch = useDispatch();
    const { loading, data, error } = useSelector((state) => state.search);

    // Handles the search action when the Search button is clicked or Enter is pressed in the input field.
    const handleSearch = () => {
        // Dispatch search action with the username from Moxfield and if including lands in stats
        dispatch(search(userName, includeLandsValue, csrfToken));
    };

    // UseEffect hook to set the selected user when the request is completed
    useEffect(() => {
        setSelectedMoxfieldUser(
            (data)
                ? {
                    ...data['moxfield_user'],
                    topTenCards: data['top_ten_cards'],
                    averageCMC: data['average_cmc'],
                    averageLands: data['average_lands']
                }
                : {}
        );
    }, [data]);

    return (
        <>
            {/* Input for Moxfield Username */}
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

            {/* Checkbox to include Lands */}
            <label className={'checkbox'}>
                <input
                    type="checkbox"
                    checked={includeLandsValue}
                    onChange={(e) => setIncludeLandsValue(e.target.checked)}
                />
                Include Lands
            </label>

            {/* Display error notification if there's an error */}
            {error && <BulmaNotification message={error} type="is-danger" />}

            {/* Display found EDH decks if selectedUser has them */}
            {
                (selectedUser?.edh_decks)
                    ? (
                        <>
                            <h4 className={'title'}>Found Decks ({selectedUser['edh_decks'].length})</h4>
                            <EDHDeckList decks={selectedUser['edh_decks']} />
                        </>
                    )
                    : null
            }

            {/* Display statistics if selectedUser has them */}
            {
                (selectedUser?.topTenCards)
                    ? (
                        <>
                            <div className={'content'}>
                                <h4 className="title">Statistics Across All Decks:</h4>
                                <h6 className="title">Average CMC</h6>
                                <p>{parseFloat(selectedUser['averageCMC']).toFixed(2)}</p>
                                <h6 className="title">Average Lands</h6>
                                <p>{parseFloat(selectedUser['averageLands']).toFixed(2)}</p>
                                <h6 className={'title'}>Top Ten Cards Across All Decks:</h6>
                                <EDHDeckList decks={selectedUser['topTenCards']} isCardList={true} />
                            </div>
                        </>
                    )
                    : null
            }

            {/* Display top ten cards in potential combos if selectedUser has EDH decks */}
            {
                (selectedUser?.edh_decks)
                    ? (<TopTenCardsInPotentialCombosList moxfieldUser={selectedUser} />)
                    : null
            }
        </>
    );
};

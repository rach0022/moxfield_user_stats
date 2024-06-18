import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { fetchCardScryfallInfo, setTop10CardsInPotentialCombos } from '../../redux/slicers/scryfallSlice.js';
import { countCardsInPotentialCombos } from "../utils/common";
import { useCSRFToken } from "../../providers/CSRFTokenContextProvider";
import EDHDeckList from "./EDHDeckList";

export default function TopTenCardsInPotentialCombosList({ moxfieldUser }) {
    const dispatch = useDispatch();
    const csrfToken = useCSRFToken();
    const top10CardsInPotentialCombos = useSelector((state) => state.cards.top10CardsInPotentialCombos);
    const topTenCardsForPotentialCombosList = useSelector((state) => state.cards.topTenCardsForPotentialCombosList);
    const requestStatus = useSelector((state) => state.cards.status);
    const responseError = useSelector((state) => state.cards.error);

    // useEffect hook to generate the top10CardsInPotentialCombos from the moxfield user
    useEffect(() => {
        // Check to make sure we have edh_decks for this moxfield user
        if ('edh_decks' in moxfieldUser && moxfieldUser['edh_decks'].length > 0) {
            // First get the card counts in the deck and then convert to tan array of sorted values
            const cardCountsInDeck = countCardsInPotentialCombos(moxfieldUser);
            const cardCountsItems = Object.entries(cardCountsInDeck);
            const sortedCardCountsArray = cardCountsItems.sort((a, b) => b[1]['count'] - a[1]['count']);

            // dispatch the event to set the top10CardsInPotentialCombos to the redux store
            dispatch(setTop10CardsInPotentialCombos(sortedCardCountsArray.slice(0, 10)));
        }
    }, [moxfieldUser]);

    // UseEffect hook to check if we have the top10CardsInPotentialCombos set and then to make the request to Scryfall
    useEffect(() => {
        if (!top10CardsInPotentialCombos || top10CardsInPotentialCombos.length === 0) {
            return;
        }
        const cardsToFindArray = top10CardsInPotentialCombos.map(card => [card[0], card[1]['count']]);
        dispatch(fetchCardScryfallInfo({ cardsToFindArray, CSRFToken: csrfToken }));
    }, [dispatch, top10CardsInPotentialCombos]);

    // Show the proper state based on the redux response status
    if (requestStatus === 'loading') {
        return <div>Loading...</div>;
    }

    if (responseError === 'failed') {
        return <div>Error: {responseError}</div>;
    }

    return (
        <div className={'content'}>
            {
                (topTenCardsForPotentialCombosList && topTenCardsForPotentialCombosList.length > 0)
                    ? (<EDHDeckList isCardList={true} decks={topTenCardsForPotentialCombosList} showFullCard={true} />)
                    : null
            }
        </div>
    );
}

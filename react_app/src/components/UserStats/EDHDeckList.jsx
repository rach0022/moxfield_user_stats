import React from 'react';
import { useSelectedEDHDeck } from "../../providers/SelectedEDHDeckContextProvider";
import EDHDeckListItem from "./EDHDeckListItem";

export default function EDHDeckList({ decks, isCardList }) {
    const { selectedDeck } = useSelectedEDHDeck();

    if (selectedDeck) {
        console.log("TODO: We need to make the selected deck modal");
    }

    return (
        <div className="edh-deck-list-component">
            <div className={'content'}>
                <div className={'grid is-col-min-12'}>
                    {decks.map((deck, idx) => (<EDHDeckListItem deck={deck} isCard={isCardList} index={idx} />))}
                </div>
            </div>

            {/* TODO: Add EDHDeckList Modal that will show content from the selected deck*/}
        </div>
    );
};

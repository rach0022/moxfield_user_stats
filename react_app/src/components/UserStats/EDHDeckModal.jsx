import React, { useState, useEffect } from 'react';
import BulmaModal from "../Bulma/BulmaModal";
import { getCardNamesInDeck } from "../utils/";


function ComboList({ combo, cardNamesInDeck, indexCount }) {
    return (
        <>
            <p>Combo #{indexCount + 1}</p>
            <ul>
                {combo['uses'].map(({ card }) => {
                    let listItemClassName = '';
                    let cardName = card['name'];
                    if (cardNamesInDeck && !cardNamesInDeck.includes(card['name'])) {
                        cardName = `${cardName} (Required)`;
                        listItemClassName = 'has-text-danger';
                    }
                    return (
                        <li className={listItemClassName}>{cardName}</li>
                    );
                })}
                <li>{combo['description']}</li>
            </ul>
        </>
    );
}

export default function EDHDeckModal({ deck, isModalOpen, setIsModalOpen }) {
    const [cardNamesInDeck, setCardNamesInDeck] = useState([]);


    // UseEffect hook that will open the modal and set the required elements like CardNamesInDeck for the EDHModal
    useEffect(() => {
        setCardNamesInDeck(getCardNamesInDeck(deck));
    }, [deck]);

    // if we don't have a deck set then return nothing
    if (!deck) {
        return;
    }

    return (
        <BulmaModal
            isVisible={isModalOpen}
            setIsVisible={setIsModalOpen}
            modalID={'commander_deck_modal'}
            title={(deck) ? deck['name'] : "Commander Deck"}
            contents={(
                <div className={'content'}>
                    <h3>Deck Size</h3>
                    <p>{deck['deck_size']} ({deck['land_count']} Lands)</p>
                    <h3>Average Mana Cost (Without Lands)</h3>
                    <p>{parseFloat(deck['average_mana_cost']).toFixed(2)}</p>
                    {
                        (deck['combos_found'].length > 0)
                            ? (
                                <>
                                    <h3>Combos Found ({deck['combos_found'].length})</h3>
                                    <div>
                                        {deck['combos_found'].map((combo, idx) => <ComboList combo={combo}
                                            indexCount={idx} />)}
                                    </div>
                                </>
                            )
                            : null
                    }
                    {
                        (deck['potential_combos'].length > 0)
                            ? (
                                <>
                                    <h3>Potential Combos ({deck['potential_combos'].length})</h3>
                                    <div>
                                        {deck['potential_combos'].map((combo, idx) => {
                                            return (
                                                <ComboList
                                                    combo={combo}
                                                    indexCount={idx}
                                                    cardNamesInDeck={cardNamesInDeck}
                                                />
                                            );
                                        })}
                                    </div>
                                </>
                            )
                            : null
                    }
                </div>
            )}
        />
    );
}

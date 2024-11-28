import React, { useState, useEffect } from 'react';
import BulmaModal from "../Bulma/BulmaModal";
import { getCardNamesInDeck } from "../utils/";

/**
 * Component to render a single combo with its uses and description.
 *
 * @component
 * @param {Object} props - React props object.
 * @param {Object} props.combo - The combo object containing 'uses' and 'description'.
 * @param {string[]} [props.cardNamesInDeck] - Array of card names present in the deck to mark required cards.
 * @param {number} props.indexCount - Index of the combo in the list.
 * @returns {JSX.Element} - Returns JSX for rendering the combo list item.
 */
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

/**
 * Modal component to display detailed information about an EDH deck, including statistics and combos.
 *
 * @component
 * @param {Object} props - React props object.
 * @param {Object} props.deck - The EDH deck object to display in the modal.
 * @param {boolean} props.isModalOpen - Flag indicating if the modal is open.
 * @param {Function} props.setIsModalOpen - Function to toggle the modal visibility.
 * @returns {JSX.Element | null} - Returns JSX for rendering the EDH deck modal or null if deck is not set.
 */
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

import React, { useState } from 'react';
import { useSelectedEDHDeck } from "../../providers/SelectedEDHDeckContextProvider";
import EDHDeckListItem from "./EDHDeckListItem";
import EDHDeckModal from "./EDHDeckModal";

/**
 * EDHDeckList component displays a list of EDH decks as either list items or cards, optionally with a modal for detailed view.
 *
 * @param {Object[]} decks - Array of EDH deck objects to display.
 * @param {boolean} isCardList - Flag indicating whether to display as cards (true) or list items (false).
 * @param {boolean} [showFullCard=false] - Flag indicating whether to show full card details in the modal.
 * @returns {JSX.Element} - Returns JSX for rendering the EDH deck list component.
 */
export default function EDHDeckList({ decks, isCardList, showFullCard = false }) {
    const [isModalOpen, setIsModalOpen] = useState(false);

    const { selectedDeck } = useSelectedEDHDeck();

    const setModalOpen = () => setIsModalOpen(true);

    return (
        <div className="edh-deck-list-component">
            <div className={'content'}>
                <div className={'grid is-col-min-12'}>
                    {decks.map((deck, idx) => (
                        <EDHDeckListItem
                            key={deck['id']}
                            deck={deck}
                            isCard={isCardList}
                            index={idx}
                            openModal={setModalOpen}
                            fullCard={showFullCard}
                        />
                    ))}
                </div>
            </div>

            {
                (isCardList)
                    ? null
                    : (
                        <EDHDeckModal
                            deck={selectedDeck}
                            isModalOpen={isModalOpen}
                            setIsModalOpen={setIsModalOpen}

                        />
                    )
            }
        </div>
    );
};

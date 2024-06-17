import React, { useState } from 'react';
import { useSelectedEDHDeck } from "../../providers/SelectedEDHDeckContextProvider";
import EDHDeckListItem from "./EDHDeckListItem";
import EDHDeckModal from "./EDHDeckModal";

export default function EDHDeckList({ decks, isCardList }) {
    const [isModalOpen, setIsModalOpen] = useState(false);

    const { selectedDeck } = useSelectedEDHDeck();

    const setModalOpen = () => setIsModalOpen(true);

    return (
        <div className="edh-deck-list-component">
            <div className={'content'}>
                <div className={'grid is-col-min-12'}>
                    {decks.map((deck, idx) => (
                        <EDHDeckListItem deck={deck} isCard={isCardList} index={idx} openModal={setModalOpen} />
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

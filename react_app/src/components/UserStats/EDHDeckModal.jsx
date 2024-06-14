import React from 'react';
import BulmaModal from "../Bulma/BulmaModal";

export default function EDHDeckModal() {
    const [isModalOpen, setIsModalOpen] = React.useState(false);
    const setModalOpen = () => setIsModalOpen(true);
    return (
        <>
            <BulmaModal
                isVisible={isModalOpen}
                setIsVisible={setIsModalOpen}
                modalID={'commander_deck_modal'}
                title={"Commander Deck"}
                contents={(
                    <h3>Test Modal</h3>
                )}
            />
            <button className="button is-primary" onClick={setModalOpen}>Open Modal</button>
        </>
    );
}

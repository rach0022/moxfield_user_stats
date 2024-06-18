import React from "react";
import { useSelectedEDHDeck } from "../../providers/SelectedEDHDeckContextProvider";

/**
 * EDHDeckListItem component displays either an MTG card or a summary of an EDH deck based on props.
 *
 * @component
 * @param {Object} props - React props object.
 * @param {Object} props.deck - The EDH deck object to display.
 * @param {boolean} [props.isCard=false] - Flag indicating whether to display as an MTG card (true) or deck summary (false).
 * @param {boolean} [props.fullCard=false] - Flag indicating whether to show the full card layout if displaying as an MTG card.
 * @param {number} props.index - Index of the deck in the list.
 * @param {Function} props.openModal - Function to open the modal for detailed view of the deck.
 * @returns {JSX.Element} - Returns JSX for rendering the EDH deck item.
 */
export default function EDHDeckListItem({ deck, isCard = false, fullCard = false, index, openModal }) {
    // context provider function to set the selected EDH Deck
    const { setSelectedEDHDeck } = useSelectedEDHDeck();

    /**
     * Handles click event on the EDH deck item.
     * Sets the selected EDH deck and opens the modal.
     */
    const handleEDHDeckClick = () => {
        setSelectedEDHDeck(deck);
        openModal();
    };

    // Check if displaying as an MTG card or deck summary
    if (isCard) {
        // Create styles for the MTG card display
        const cardStyles = {
            ...edhDeckListItemStyles.deckCell,
            backgroundImage: `url("${deck['image_url']}")`
        };

        // Adjust height for full card display
        if (fullCard) {
            cardStyles['height'] = '400px';
        }

        return (
            <div className={'user_moxfield_deck'} style={cardStyles}>
                <div className={'deck_label sub_title has-text-center'}>
                    <p style={{ marginBottom: 0, ...edhDeckListItemStyles.textLabelShadow }}>
                        {deck['name']} ({deck['quantity']})
                    </p>
                </div>
                <div className={'deck_label has-text-center'}>
                    <p style={edhDeckListItemStyles.textLabelShadow}>
                        Rank {index + 1}
                    </p>
                </div>
            </div>
        );
    } else {
        // Get commander names and combo count for the deck summary
        const commanderNames = deck['commanders'].map(commander => commander.name).join(",");
        const comboCount = deck['combos_found'].length;

        return (
            <div
                className={'user_moxfield_deck'}
                style={{
                    ...edhDeckListItemStyles.deckCell,
                    backgroundImage: `radial-gradient(transparent, rgb(0, 0, 0)), url("${deck['commanders'][0]['image_url']}")`
                }}
                onClick={handleEDHDeckClick}
            >
                <div className={'deck_label has-text-left'}>
                    <p style={{ marginBottom: 0, marginLeft: '1em' }}>{deck['name']}</p>
                    <div className={'deck_label sub_title is-size-7 has-text-left'}>
                        {commanderNames}
                    </div>
                </div>

                <div className={'commander_deck_label'} style={edhDeckListItemStyles.commanderTag}>
                    <span className={`tag ${(comboCount > 0) ? 'is-success' : 'is-warning'}`}>
                        {`Combos (${comboCount})`}
                    </span>
                </div>
            </div>
        );
    }
}

// Styles for the EDHDeckListItem component
const edhDeckListItemStyles = {
    deckCell: {
        width: '300px',
        height: '200px',
        backgroundSize: 'cover',
    },
    textLabelShadow: {
        color: '#FFFFFF',
        textShadow: '0 0 4px black, 0 0 4px black, 0 0 4px black, 0 0 4px black, 0 0 4px black'
    },
    commanderTag: {
        width: '100% !important',
        marginBottom: '0.5em',
        marginRight: '1em'
    }
};

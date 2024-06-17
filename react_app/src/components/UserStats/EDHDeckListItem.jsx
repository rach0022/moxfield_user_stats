import React from "react";
import { useSelectedEDHDeck } from "../../providers/SelectedEDHDeckContextProvider";


export default function EDHDeckListItem({ deck, isCard = false, fullCard = false, index, openModal }) {
    // context provider function to set the selected EDH Deck
    const { setSelectedEDHDeck } = useSelectedEDHDeck();
    const handleEDHDeckClick = () => {
        setSelectedEDHDeck(deck);
        openModal();
    };

    // Check if we are showing an actual MTG card or a full deck list
    if (isCard) {
        // create the card styles by merging hte deck cell with backgroundImage prod
        const cardStyles = {
            ...edhDeckListItemStyles.deckCell,
            backgroundImage: `url("${deck['image_url']}")`
        };

        // if we are showing a full card, increase the height to 400px
        if (fullCard) {
            cardStyles['height'] = '400px';
        }
        return (
            <div
                className={'user_moxfield_deck'}
                style={cardStyles}
            >
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
        // Get the commander names (from all commanders) by joining the names into one string
        const commanderNames = deck['commanders'].map(commander => commander.name).join(",");
        const comboCount = deck['combos_found'].length;

        return (
            <div className={'user_moxfield_deck'}
                style={{
                    ...edhDeckListItemStyles.deckCell,
                    backgroundImage: `radial-gradient(transparent, rgb(0, 0, 0)), url("${deck['commanders'][0]['image_url']}")`
                }}
                onClick={handleEDHDeckClick}
            >
                {/* The title and commanders of the EDH decks*/}
                <div className={'deck_label has-text-left'}>
                    <p style={{ marginBottom: 0, marginLeft: '1em' }}>{deck['name']}</p>
                    <div className={'deck_label sub_title is-size-7 has-text-left'}>
                        {commanderNames}
                    </div>
                </div>

                {/* The tags and combos counts for the edh deck*/}
                <div
                    className={'commander_deck_label'}
                    style={edhDeckListItemStyles.commanderTag}
                >
                <span className={`tag ${(comboCount > 0) ? 'is-success' : 'is-warning'}`}>
                    {`Combos (${comboCount})`}
                </span>
                </div>
            </div>
        );
    }
}

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

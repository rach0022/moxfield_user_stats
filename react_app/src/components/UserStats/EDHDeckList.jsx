import React from 'react';
import { useSelectedEDHDeck } from "../../providers/SelectedEDHDeckContextProvider";

export default function EDHDeckList({ decks }) {
    const { setSelectedEDHDeck, selectedDeck } = useSelectedEDHDeck();

    return (
        <div className="edh-deck-list-component">
            <div className={'content'}>
                <div className={'grid is-col-min-12'}>
                    {decks.map(deck => {
                        const commanderNames = deck['commanders'].map(commander => commander.name).join(",");
                        const comboCount = deck['combos_found'].length;

                        return (
                            <div className={'user_moxfield_deck'}
                                style={{
                                    ...edhDeckListStyles.deckCell,
                                    backgroundImage: `radial-gradient(transparent, rgb(0, 0, 0)), url("${deck['commanders'][0]['image_url']}")`
                                }}
                                onClick={setSelectedEDHDeck(deck)}
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
                                    style={edhDeckListStyles.commanderTag}
                                >
                                    <span className={`tag ${(comboCount > 0) ? 'is-success' : 'is-warning'}`}>
                                        {`Combos (${comboCount})`}
                                    </span>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

        {/* TODO: Add EDHDeckList Modal that will show content from the selected deck*/}
        </div>
    );
};


const edhDeckListStyles = {
    deckCell: {
        width: '300px',
        height: '200px',
        backgroundSize: 'cover',
    },
    commanderTag: {
        width: '100% !important',
        marginBottom: '0.5em',
        marginRight: '1em'
    }
};
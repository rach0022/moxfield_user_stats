export function getCardNamesInDeck(edhDeck) {

    if (!edhDeck) {
        return [];
    }
    const commanderNamesArray = edhDeck['commanders'].map(commander => commander.name);
    const companionNamesArray = edhDeck['companions'].map(companion => companion.name);
    const cardNamesArray = edhDeck['main_board'].map(card => card.name);
    return [...commanderNamesArray, ...companionNamesArray, ...cardNamesArray];
}

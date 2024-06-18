/**
 * Get all card names from an EDH deck, including commanders, companions, and main board cards.
 *
 * @param {Object} edhDeck - The EDH deck object.
 * @param {Array} edhDeck.commanders - Array of commander objects in the deck.
 * @param {Array} edhDeck.companions - Array of companion objects in the deck.
 * @param {Array} edhDeck.main_board - Array of main board card objects in the deck.
 * @returns {Array} - Array of card names in the deck.
 */
export function getCardNamesInDeck(edhDeck) {

    if (!edhDeck) {
        return [];
    }
    const commanderNamesArray = edhDeck['commanders'].map(commander => commander.name);
    const companionNamesArray = edhDeck['companions'].map(companion => companion.name);
    const cardNamesArray = edhDeck['main_board'].map(card => card.name);
    return [...commanderNamesArray, ...companionNamesArray, ...cardNamesArray];
}

/**
 * Count the occurrences of cards in potential combos across all EDH decks of a Moxfield user.
 *
 * @param {Object} moxfieldUser - The Moxfield user object.
 * @param {Array} moxfieldUser.edh_decks - Array of EDH deck objects belonging to the user.
 * @returns {Object} - An object where the keys are card names and the values are objects containing
 *                     the count of occurrences and the names of decks they appear in.
 */
export function countCardsInPotentialCombos(moxfieldUser) {
    // first initialize an object to store the card counts as card_name: key and count as value
    const cardCountsObject = {};

    // Now iterate through each deck of the moxfield user
    moxfieldUser['edh_decks'].forEach(deck => {
        // Get all the card names in the deck as an array of strings
        const cardNamesInDeck = getCardNamesInDeck(deck);

        // Get a List of all the cards in the Potential Combos for this deck
        const cardsInPotentialCombos = [];
        deck['potential_combos'].forEach(({ uses }) => uses.forEach(({ card }) => cardsInPotentialCombos.push(card['name'])));

        // For each card in the potential combos, check if it is in the deck and then count up the instances
        cardsInPotentialCombos.forEach(card => {
            if (~cardNamesInDeck.includes(card)) {
                // Initialize the counts if the card is already in the deck otherwise increment the value
                if (card in cardCountsObject) {
                    cardCountsObject[card]['count'] += 1;

                    // Add the deck name if the deck isn't already listed
                    if (!cardCountsObject[card]['decks'].includes(deck['name'])) {
                        cardCountsObject[card]['decks'].push(deck['name']);
                    }
                } else {
                    // Initialize the dict
                    cardCountsObject[card] = {
                        'count': 1,
                        'decks': [deck['name']]
                    };
                }
            }
        });
    });
    return cardCountsObject;
}

const userDecksApp = {
    moxfieldUser: null,
    cardCountsInPotentialCombos: null,
    top10CardsInPotentialCombos: null,
    init: () => {
        console.log("User Decks App is initialized...");

        document.getElementById('search_moxfield_user_name').addEventListener('click', userDecksApp.searchUserDecks);
        document.getElementById('include_lands_checkbox').addEventListener('click', userDecksApp.searchUserDecks);
    },
    searchUserDecks: () => {
        const userName = document.getElementById('user_name_input').value;
        const includeLandsValue = document.getElementById('include_lands_checkbox').checked;
        const searchButton = document.getElementById('search_moxfield_user_name');
        userDecksApp.moxfieldUser = null;
        userDecksApp.cardCountsInPotentialCombos = null;
        userDecksApp.top10CardsInPotentialCombos = null;
        searchButton.classList.add('is-loading');

        fetch('/search', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json', 'X-CSRFToken': userDecksApp.getCsrfToken()
            },
            body: JSON.stringify({ user_name: userName, include_lands: includeLandsValue })
        }).then(response => response.json())
            .then(data => {
                console.log(data);
                if (data['error']) {
                    userDecksApp.showErrorNotification(data['error']);
                } else {
                    userDecksApp.handleSearchResults(data);
                }
            })
            .catch(error => console.error('Error:', error))
            .finally(() => searchButton.classList.remove('is-loading'));
    },
    // function to request the information for the top ten cards found in potential combos
    searchPotentialComboCards: () => {
        if (!userDecksApp.top10CardsInPotentialCombos) {
            return;
        }

        // If we have the top ten cards, make the list of cards from the top ten and format it for the request
        const cardToFindArray = userDecksApp.top10CardsInPotentialCombos.map(card => [card[0], card[1]['count']]);

        // Make the post request to the back-end to get the scryfall info
        fetch('/get_card_scryfall_info', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json', 'X-CSRFToken': userDecksApp.getCsrfToken()
            },
            body: JSON.stringify({ 'cards_to_find': cardToFindArray })
        }).then(response => response.json())
            .then(data => {
                // Build the grid cells for the top ten cards to add for potential combos list
                userDecksApp.populateDeckGrid(
                    data['found_cards'], 'top_ten_cards_for_potential_combos_list', 'card',
                    true, true
                );
            }).catch(err => console.error("There was an error getting Scryfall Info for Top 10 Cards", err));
    },
    // General function to set combo list title
    setComboListTitle: (comboListTitleNode, title, count) => {
        comboListTitleNode.textContent = `${title} (${count})`;
    },
    // General function to create and append combo list items
    createComboListItems: (comboListNode, combos, cardNamesInDeck = null) => {
        const comboListNodeFrag = document.createDocumentFragment();
        combos.forEach((combo, idx) => {
            // Create the list container for the combo
            const comboList = document.createElement('ul');
            const comboName = document.createElement('p');
            comboName.textContent = `Combo #${idx + 1}`;
            const comboDescription = document.createElement('li');
            comboDescription.textContent = combo['description'];

            // Get the cards required for the combo
            combo['uses'].forEach(({ card }) => {
                const cardElement = document.createElement('li');
                cardElement.textContent = card['name'];

                // if it is a potential combo, show the first card as red since it is the card we need to make the combo
                if (cardNamesInDeck && !cardNamesInDeck.includes(card['name'])) {
                    cardElement.className = 'has-text-danger';
                    cardElement.textContent = `${cardElement.textContent} (Required)`;
                }
                comboList.appendChild(cardElement);
            });

            // Finally add the combo list to the document fragment
            comboListNodeFrag.appendChild(comboName);
            comboList.appendChild(comboDescription);
            comboListNodeFrag.appendChild(comboList);
        });

        // With all the combos added to the document fragment, add the fragment to the DOM
        comboListNode.innerHTML = ""; // Clear existing content
        comboListNode.appendChild(comboListNodeFrag);
    },
    handleOpenCommanderDeckModal: (clickEvent) => {
        if (!userDecksApp.moxfieldUser) {
            // Exit out early since no decks are loaded
            return;
        }

        // First get the deck that was clicked from the modal trigger button and then find the index of the deck
        const deckID = clickEvent.currentTarget.getAttribute('data-deck-id');
        const deckIndex = userDecksApp.moxfieldUser['edh_decks'].findIndex(deck => deck.id === deckID);
        const selectedDeck = userDecksApp.moxfieldUser['edh_decks'][deckIndex];

        // Set the html nodes in the modal to display deck stats
        document.getElementById('commander_deck_modal_title').textContent = selectedDeck['name'];
        document.getElementById('commander_deck_modal_count').textContent = `${selectedDeck['deck_size']} (${selectedDeck['land_count']} Lands)`;
        document.getElementById('commander_deck_modal_average_cmc').textContent = selectedDeck['average_mana_cost'].toFixed(2);

        // Set the title for the combo list
        const comboListTitleNode = document.getElementById('commander_deck_modal_combo_list_title');
        userDecksApp.setComboListTitle(comboListTitleNode, 'Combos Found', selectedDeck['combos_found'].length);

        // Add all the content for the combo list
        const comboListNode = document.getElementById('commander_deck_modal_combo_list');
        userDecksApp.createComboListItems(comboListNode, selectedDeck['combos_found']);

        // Show the items for the potential combos in the modal
        const potentialComboListTitleNode = document.getElementById('commander_deck_modal_potential_combo_list_title');
        userDecksApp.setComboListTitle(potentialComboListTitleNode, 'Potential Combos Found', selectedDeck['potential_combos'].length);

        // add all the content for the potential combos list
        const potentialComboListNode = document.getElementById('commander_deck_modal_potential_combo_list');

        // To show the card that is required build a list of all the card names in the selected deck
        userDecksApp.createComboListItems(potentialComboListNode, selectedDeck['potential_combos'], userDecksApp.getCardNamesInDeck(selectedDeck));

        // Show the modal
        const modalScreen = document.getElementById('commander_deck_modal');
        if (!modalScreen.classList.contains('is-active')) {
            modalScreen.classList.add('is-active');
        }
    },
    getCardNamesInDeck: (edhDeck) => {
        const commanderNamesArray = edhDeck['commanders'].map(commander => commander.name);
        const companionNamesArray = edhDeck['companions'].map(companion => companion.name);
        const cardNamesArray = edhDeck['main_board'].map(card => card.name);
        return [...commanderNamesArray, ...companionNamesArray, ...cardNamesArray];
    },
    handleSearchResults: (data) => {
        // First set the response data to the application to be used later when opening modals
        userDecksApp.moxfieldUser = data['moxfield_user'];
        const decks = data['moxfield_user']['edh_decks'];
        const deckCount = decks.length;

        document.getElementById('found_decks_title').textContent = `Found Decks (${deckCount})`;
        userDecksApp.populateDeckGrid(decks, 'found_decks_list', 'commanders');

        const statisticsSection = document.getElementById('deck_statistics_section');
        if (deckCount > 0) {
            statisticsSection.className = 'content';
            userDecksApp.populateDeckGrid(
                data['top_ten_cards'], 'top_ten_cards_list', 'card', true
            );
            document.getElementById('average_cmc_text').textContent = data['average_cmc'].toFixed(2);
            document.getElementById('average_lands_text').textContent = data['average_lands'].toFixed(2);
        } else {
            statisticsSection.className = 'content hidden';
        }

        // Set the card counts from the potential combos to the userDecksApp
        userDecksApp.cardCountsInPotentialCombos = userDecksApp.countCardsInPotentialCombos();

        // Now get the top ten cards from the cards in potential combos
        // First convert the counts object into an array
        const countCountsItems = Object.entries(userDecksApp.cardCountsInPotentialCombos);

        // Sort the array based on the values
        const sortedCardCountsArray = countCountsItems.sort((a, b) => b[1]['count'] - a[1]['count']);

        // Set the top ten cards to the userDecksApp and populate the deck grid
        userDecksApp.top10CardsInPotentialCombos = sortedCardCountsArray.slice(0, 10);
        userDecksApp.searchPotentialComboCards();
    },
    populateDeckGrid: (items, gridId, imageType, isTopTen = false, showFullCard = false) => {
        const gridSection = document.getElementById(gridId);
        gridSection.innerHTML = "";

        items.forEach((item, idx) => {
            const isCommanderImage = (imageType === 'commanders');
            const imageUrl = (isCommanderImage) ? item['commanders'][0]['image_url'] : item['image_url'];
            const deckCell = userDecksApp.createDeckCell(
                item, imageUrl, idx, isTopTen, isCommanderImage, showFullCard,
                (items[idx]['combos_found']) ? items[idx]['combos_found'].length : 0
            );
            gridSection.appendChild(deckCell);
        });
    },
    createDeckCell: (item, imageUrl, idx, isTopTen, commanderDeck = false, showFullCard = false, comboCount = 0) => {
        const deckCell = document.createElement('div');
        deckCell.className = 'user_moxfield_deck';
        deckCell.style.width = '300px';
        deckCell.style.height = '200px';
        deckCell.style.backgroundSize = 'cover';
        deckCell.style.backgroundImage = `radial-gradient(transparent, rgb(0, 0, 0)), url("${imageUrl}")`;

        // if we are showing the full card increase the height
        if (showFullCard) {
            deckCell.style.height = '400px';
            deckCell.style.backgroundImage = `url("${imageUrl}")`;
        }

        // if it is a commander deck set the deck id as the attribute data-deck-id to be used with modal opening
        if (commanderDeck) {
            deckCell.setAttribute('data-deck-id', item.id);
            deckCell.addEventListener('click', userDecksApp.handleOpenCommanderDeckModal);
        }

        if (isTopTen) {
            const cardNameLabel = userDecksApp.createLabel(`${item.name} (${item['quantity']})`, true);
            const cardRankLabel = userDecksApp.createLabel(`Rank ${idx + 1}`);

            // If we are showing the full card we need to invert the text and add a black text shadow to border
            if (showFullCard) {
                cardNameLabel.style.color = '#FFFFFF';
                cardNameLabel.style.textShadow = '0 0 4px black, 0 0 4px black, 0 0 4px black, 0 0 4px black, 0 0 4px black';
                cardRankLabel.style.color = '#FFFFFF';
                cardRankLabel.style.textShadow = '0 0 4px black, 0 0 4px black, 0 0 4px black, 0 0 4px black, 0 0 4px black';
            }
            deckCell.appendChild(cardNameLabel);
            deckCell.appendChild(cardRankLabel);
        } else {
            // Show the deck name first and underneath show the commander name
            const commanderText = item['commanders'].map(commander => commander.name).join(",");
            const commanderTextTitle = userDecksApp.createLabel(item.name, true);
            commanderTextTitle.style.marginBottom = '0';
            commanderTextTitle.appendChild(userDecksApp.createLabel(commanderText, false, true));
            deckCell.appendChild(commanderTextTitle);

            // Create the div that holds the tags for the commander deck
            const commanderTextDiv = document.createElement('div');
            commanderTextDiv.className = 'commander_deck_label';
            commanderTextDiv.style.width = '100% !important';
            commanderTextDiv.style.marginBottom = '0.5em';
            commanderTextDiv.style.marginRight = '1em';

            // Create the tag that shows the number of combos on the deck
            const commanderComboTag = document.createElement('span');
            commanderComboTag.className = `tag ${(comboCount > 0) ? 'is-success' : 'is-warning'}`;
            commanderComboTag.textContent = `Combos (${comboCount})`;

            // Add the tag to the text div and then to the deck cell
            commanderTextDiv.appendChild(commanderComboTag);
            deckCell.appendChild(commanderTextDiv);
        }
        return deckCell;
    },
    createLabel: (text, title = false, small = false) => {
        const container = document.createElement('div');
        container.className = (title) ? 'deck_label sub_title' : 'deck_label';

        if (small) {
            container.classList.add('is-size-7');
            container.classList.add('has-text-left');
        }

        const p = document.createElement('p');
        p.textContent = text;
        p.style.marginBottom = (title) ? 0 : p.style.marginBottom;
        container.appendChild(p);

        return container;
    },
    getCsrfToken: () => {
        let cookieValue = null;
        if (document.cookie && document.cookie !== '') {
            const cookies = document.cookie.split(';');
            for (let i = 0; i < cookies.length; i++) {
                const cookie = cookies[i].trim();
                if (cookie.substring(0, 10) === 'csrftoken=') {
                    cookieValue = decodeURIComponent(cookie.substring(10));
                    break;
                }
            }
        }
        return cookieValue;
    },
    countCardsInPotentialCombos: () => {
        // First check that we have an instance of the moxfield user
        if (!userDecksApp.moxfieldUser) {
            return;
        }
        // Start an object to keep track of all the counts of cards in each of the combos
        const cardCountsObject = {};

        // For each deck in the moxfield user instance, count the cards needed in the potential combos
        userDecksApp.moxfieldUser['edh_decks'].forEach(deck => {
            // First get all the cards in the deck, so we can see what cards we are missing
            const cardNamesInDeck = userDecksApp.getCardNamesInDeck(deck);

            // Get the Cards from the potential combos
            const cardsInCombos = [];
            deck['potential_combos'].forEach(({ uses }) => {
                uses.forEach(({ card }) => cardsInCombos.push(card.name));
            });

            // For each card in the combo, check if it's not in the deck and then count up the items
            cardsInCombos.forEach(card => {
                if (!cardNamesInDeck.includes(card)) {
                    if (card in cardCountsObject) {
                        cardCountsObject[card]['count'] += 1;
                        if (!cardCountsObject[card]['decks'].includes(deck.name)) {
                            cardCountsObject[card]['decks'].push(deck.name);
                        }
                    } else {
                        cardCountsObject[card] = {
                            'count': 1,
                            'decks': [deck.name]
                        };
                    }
                }
            });
        });
        return cardCountsObject;
    },
    showErrorNotification: (errorMessage) => {
        // Create a Bulma Notification and add it to the DOM
        const notificationNode = document.createElement('div');
        notificationNode.className = 'notification is-danger is-light';

        // Create the delete button and add the click listener to it
        const notificationDeleteButton = document.createElement('button');
        notificationDeleteButton.className = 'delete';
        notificationDeleteButton.addEventListener('click', bulmaNotificationApp.handleCloseModal);

        // Add the button to the notification and then update the inner html with the error message
        const notificationText = document.createElement('p');
        notificationText.textContent = errorMessage;
        notificationNode.appendChild(notificationDeleteButton);
        notificationNode.appendChild(notificationText);

        // Now show the notification before the main section
        const mainSection = document.getElementById('main_section');
        mainSection.parentNode.insertBefore(notificationNode, mainSection);

        // start a timeOut to delete the notification after 3 seconds
        setTimeout(() => notificationNode.parentNode.removeChild(notificationNode), 3000);
    }
};

document.addEventListener('DOMContentLoaded', userDecksApp.init);

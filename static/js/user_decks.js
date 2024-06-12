const userDecksApp = {
    moxfieldUser: null,
    init: () => {
        console.log("User Decks App is initialized...");

        document.getElementById('search_moxfield_user_name').addEventListener(
            'click', userDecksApp.searchUserDecks
        );
        document.getElementById('include_lands_checkbox').addEventListener(
            'click', userDecksApp.searchUserDecks
        );
    },
    searchUserDecks: () => {
        const userName = document.getElementById('user_name_input').value;
        const includeLandsValue = document.getElementById('include_lands_checkbox').checked;
        const searchButton = document.getElementById('search_moxfield_user_name');
        userDecksApp.moxfieldUser = null;
        searchButton.classList.add('is-loading');

        fetch('/search', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': userDecksApp.getCsrfToken()
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
        const commanderNamesArray = selectedDeck['commanders'].map(commander => commander.name);
        const companionNamesArray = selectedDeck['companions'].map(companion => companion.name);
        const cardNamesArray = selectedDeck['main_board'].map(card => card.name);
        userDecksApp.createComboListItems(
            potentialComboListNode, selectedDeck['potential_combos'],
            [...commanderNamesArray, ...companionNamesArray, ...cardNamesArray]
        );

        // Show the modal
        const modalScreen = document.getElementById('commander_deck_modal');
        if (!modalScreen.classList.contains('is-active')) {
            modalScreen.classList.add('is-active');
        }
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
    },
    populateDeckGrid: (items, gridId, imageType, isTopTen = false) => {
        const gridSection = document.getElementById(gridId);
        gridSection.innerHTML = "";

        items.forEach((item, idx) => {
            const isCommanderImage = (imageType === 'commanders');
            const imageUrl = (isCommanderImage) ? item['commanders'][0]['image_url'] : item['image_url'];
            const deckCell = userDecksApp.createDeckCell(
                item, imageUrl, idx, isTopTen, isCommanderImage
            );
            gridSection.appendChild(deckCell);
        });
    },
    createDeckCell: (item, imageUrl, idx, isTopTen, commanderDeck = false) => {
        const deckCell = document.createElement('div');
        deckCell.className = 'user_moxfield_deck';
        deckCell.style.width = '300px';
        deckCell.style.height = '200px';
        deckCell.style.backgroundSize = 'cover';
        deckCell.style.backgroundImage = `radial-gradient(transparent, rgb(0, 0, 0)), url("${imageUrl}")`;

        // if it is a commander deck set the deck id as the attribute data-deck-id to be used with modal opening
        if (commanderDeck) {
            deckCell.setAttribute('data-deck-id', item.id);
            deckCell.addEventListener('click', userDecksApp.handleOpenCommanderDeckModal);
        }

        if (isTopTen) {
            deckCell.appendChild(userDecksApp.createLabel(`${item.name} (${item['quantity']})`, true));
            deckCell.appendChild(userDecksApp.createLabel(`Rank ${idx + 1}`));
        } else {
            const commanderText = item['commanders'].map(commander => commander.name).join(",");
            deckCell.appendChild(userDecksApp.createLabel(item.name, true));
            deckCell.appendChild(userDecksApp.createLabel(commanderText));
        }
        return deckCell;
    },
    createLabel: (text, title = false) => {
        const container = document.createElement('div');
        container.className = (title) ? 'deck_label sub_title' : 'deck_label';

        const p = document.createElement('p');
        p.textContent = text;
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
        setTimeout(() => {
            notificationNode.parentNode.removeChild(notificationNode);
        }, 3000);
    }
};

document.addEventListener('DOMContentLoaded', userDecksApp.init);

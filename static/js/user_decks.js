const userDecksApp = {
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
        searchButton.classList.add('is-loading');

        fetch('/search', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': userDecksApp.getCsrfToken()
            },
            body: JSON.stringify({ user_name: userName, include_lands: includeLandsValue })
        }).then(response => response.json())
            .then(userDecksApp.handleSearchResults)
            .catch(error => console.error('Error:', error))
            .finally(() => searchButton.classList.remove('is-loading'));
    },
    handleSearchResults: (data) => {
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
            const imageUrl = (imageType === 'commanders') ? item['commanders'][0]['image_url'] : item['image_url'];
            const deckCell = userDecksApp.createDeckCell(item, imageUrl, idx, isTopTen);
            gridSection.appendChild(deckCell);
        });
    },
    createDeckCell: (item, imageUrl, idx, isTopTen) => {
        const deckCell = document.createElement('div');
        deckCell.className = 'user_moxfield_deck';
        deckCell.style.width = '300px';
        deckCell.style.height = '200px';
        deckCell.style.backgroundSize = 'cover';
        deckCell.style.backgroundImage = `radial-gradient(transparent, rgb(0, 0, 0)), url("${imageUrl}")`;

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
    }
};

document.addEventListener('DOMContentLoaded', userDecksApp.init);

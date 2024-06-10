const userDecksApp = {
    init: () => {
        // output to the console to show the js file is loaded
        console.log("User Decks App is initialized...");

        // add the event listeners required for the application
        document.getElementById('search_moxfield_user_name').addEventListener(
            'click', userDecksApp.searchUserDecks
        );
    },
    searchUserDecks: (clickEvent) => {
        // First stop the event from bubbling up and the default form actions
        clickEvent.stopPropagation();
        clickEvent.preventDefault();

        // Get the username from the input and show a loading wheel in the button
        const userName = document.getElementById('user_name_input').value;
        clickEvent.currentTarget.classList.add('is-loading');

        // Send the request to the Django Backend
        fetch('/search', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': userDecksApp.getCsrfToken()  // Add CSRF token to headers
            },
            body: JSON.stringify({ user_name: userName })
        }).then(
            response => response.json()
        ).then(data => {
            // Update the title for the found decks
            document.getElementById('found_decks_title').textContent = `Found Decks (${data['edh_decks'].length})`;
            // Now that we found the decks, list them all by name in the grid section
            const gridSection = document.getElementById('found_decks_list');
            gridSection.innerHTML = ""
            data['edh_decks'].forEach(deck => {
                const commanderText = deck.commanders.map(commander => commander.name).join(",");
                const deckCell = document.createElement('div');
                deckCell.className = 'cell has-background-primary has-text-primary-invert has-radius-normal';
                deckCell.textContent = `${deck.name} - ${commanderText}`;
                gridSection.appendChild(deckCell);
            });

            // Optionally show the deck statistics section if we find decks
            document.getElementById('deck_statistics_section').className = (data['edh_decks'].length > 0)
                ? 'content'
                : 'content hidden';
        }).catch((error) => {
            console.error('Error:', error);
        }).finally(() => {
            document.getElementById('search_moxfield_user_name').classList.remove('is-loading');
        });
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

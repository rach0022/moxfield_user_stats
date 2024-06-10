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

        // Get the username from the input
        const userName = document.getElementById('user_name_input').value;
        console.log(userName);

        // Send the request to the Django Backend
    }
};

document.addEventListener('DOMContentLoaded', userDecksApp.init);

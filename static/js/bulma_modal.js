// Copied from https://bulma.io/documentation/components/modal/
const bulmaModalApp = {
    // Function to open a specific modal
    openModal: (modalElement) => modalElement.classList.add('is-active'),
    // function to close a specific modal
    closeModal: (modalElement) => modalElement.classList.remove('is-active'),
    // function to close all modals
    closeAllModals: () => {
        Array.from(document.querySelectorAll('.modal')).forEach((modalNode) => {
            bulmaModalApp.closeModal(modalNode);
        });
    },
    // add event listeners for modal buttons, triggers and keyboard to open/ close modals
    init: () => {
        // Add a click event on buttons to open a specific modal
        Array.from(document.querySelectorAll('.js-modal-trigger')).forEach((triggerNode) => {
            const modal = triggerNode.dataset.target;
            const $target = document.getElementById(modal);

            triggerNode.addEventListener('click', () => {
                bulmaModalApp.openModal($target);
            });
        });

        // Add a click event on various child elements to close the parent modal
        Array.from(document.querySelectorAll(
            '.modal-background, .modal-close, .modal-card-head .delete, .modal-card-foot .button')
        ).forEach((closeTrigger) => {
            const modalToClose = closeTrigger.closest('.modal');

            closeTrigger.addEventListener('click', () => {
                bulmaModalApp.closeModal(modalToClose);
            });
        });

        // Add a keyboard event to close all modals
        document.addEventListener('keydown', (event) => {
            if (event.key === "Escape") {
                bulmaModalApp.closeAllModals();
            }
        });
    }
};

document.addEventListener('DOMContentLoaded', bulmaModalApp.init);

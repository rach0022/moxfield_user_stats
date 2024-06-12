bulmaNotificationApp = {
    init: () => {
        Array.from(document.querySelectorAll('.notification .delete')).forEach((deleteNotificationNode) => {
            deleteNotificationNode.addEventListener('click', bulmaNotificationApp.handleCloseModal);
        });
    },
    handleCloseModal: (clickEvent) => {
        const notificationNode = clickEvent.currentTarget.parentNode;
        notificationNode.parentNode.removeChild(notificationNode);
    }
};


document.addEventListener('DOMContentLoaded', bulmaNotificationApp.init);

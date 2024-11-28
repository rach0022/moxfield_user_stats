import React, { useState } from 'react';

export default function BulmaModal({ modalID, title, contents, modalButtons, isVisible, setIsVisible }) {

    // Create the clickEvents that the modal will handle events like onClose
    const [isActive, setIsActive] = useState(false);
    const handleModalClose = () => {
        setIsActive(false);
        setIsVisible(false);
    };

    return (
        <div className={`modal ${(isActive || isVisible) ? 'is-active' : ''}`} id={modalID}>
            <div className="modal-background" onClick={handleModalClose}></div>
            <div className="modal-card">
                {/* The Header for the modal */}
                <header className="modal-card-head">
                    <p className="modal-card-title" id={`${modalID}_title`}>{title}</p>
                    <button className="delete" aria-label="close" onClick={handleModalClose}></button>
                </header>
                {/* The Content for the Modal*/}
                <section className="modal-card-body">
                    <div className="content">
                        {contents}
                    </div>
                </section>
                {/* The Footer for the modal, buttons must be supplied to component*/}
                <footer className="modal-card-foot">
                    <div className="buttons">
                        {modalButtons}
                        <button className="button" onClick={handleModalClose}>Close</button>
                    </div>
                </footer>
            </div>
            <button className="modal-close is-large" aria-label="close" onClick={handleModalClose}></button>
        </div>
    );
}

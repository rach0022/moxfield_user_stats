import React, { useState, useEffect } from 'react';

export default function BulmaNotification({ message, type, timeOut = 3000 }) {
    const [isActive, setIsActive] = useState(true);
    const [progress, setProgress] = useState(100);

    const handleClose = () => setIsActive(false);

    useEffect(() => {
        // update the progress bar every 100ms
        const progressBarIntervalMS = 100;
        const decrement = (progressBarIntervalMS / timeOut) * 100;


        // we can save the interval id to the progressInterval so we can clear it when the function returns
        const progressInterval = setInterval(() => {
            setProgress((prevProgress) => {
                // check the current progress by subtracting the decrement amount from the previous progress
                const currentProgress = prevProgress - decrement;

                // Once the current Progress left is 0 we can clear the interval and close the notification
                if (currentProgress <= 0) {
                    clearInterval(progressInterval);
                    handleClose();
                }
                return currentProgress;
            });
        }, progressBarIntervalMS);

        return () => clearInterval(progressInterval);
    }, [timeOut]);

    return isActive ? (
        <div className={`notification ${type}`} style={notificationStyles.notification}>
            <button className="delete" onClick={handleClose} />
            {message}
            <progress
                style={notificationStyles.progressBar}
                className="progress is-warning is-small"
                value={progress}
                max="100"
            />
        </div>
    ) : null;
}

const notificationStyles = {
    notification: {
        position: 'relative'
    },
    progressBar: {
        borderRadius: 0,
        position: 'absolute',
        bottom: 0,
        left: 0,
        width: '100%',
        margin: 0
    }
};
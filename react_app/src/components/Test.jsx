import React from 'react';
import BulmaNotification from './Bulma/BulmaNotification.jsx';

export default function Test() {

    const testContentForNotification = (
        <p className={'has-text-weight-bold'}>The is the notification test content</p>
    );

    return (
        <>
            <h1 className="title">Test Component</h1>
            <BulmaNotification message={testContentForNotification} type="is-primary" />
        </>
    );
}

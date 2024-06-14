import React from 'react';
import ReactDOM from 'react-dom/client';
import './css/index.css';
import 'bulma/css/bulma.css';
import HomeScreen from "./screens/HomeScreen";

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
    <React.StrictMode>
        <HomeScreen />
    </React.StrictMode>
);

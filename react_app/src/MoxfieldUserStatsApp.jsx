import React from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import store from './redux/store.js';
import './css/index.css';
import 'bulma/css/bulma.css';
import HomeScreen from "./screens/HomeScreen";
import { CSRFTokenProvider } from "./providers/CSRFTokenContextProvider";

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
    <React.StrictMode>
        <CSRFTokenProvider>
            <Provider store={store}>
                <HomeScreen />
            </Provider>
        </CSRFTokenProvider>
    </React.StrictMode>
);

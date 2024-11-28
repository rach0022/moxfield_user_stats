import React from 'react';

export default function AppHeader({}) {
    return (
        <nav className="navbar" role="navigation" aria-label="main navigation">
            <div className="navbar-brand">
                <a className="navbar-item" href="/">
                    <img src="/static/img/favicon-32x32.png" alt="Logo" width="28" height="28" />
                </a>
                <a role="button" className="navbar-burger" aria-label="menu" aria-expanded="false" data-target="navBar">
                    <span aria-hidden="true"></span>
                    <span aria-hidden="true"></span>
                    <span aria-hidden="true"></span>
                </a>
            </div>
            <div id="navBar" className="navbar-menu">
                <div className="navbar-end">
                    <a className="navbar-item" href="/">
                        Home
                    </a>
                </div>
            </div>
        </nav>
    );
};

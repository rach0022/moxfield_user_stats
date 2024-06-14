import React from 'react';
import Test from "../components/Test.jsx";
import EDHDeckModal from "../components/UserStats/EDHDeckModal";

export default function HomeScreen() {
    return (
        <section className="section" id="main_section">
            <div className="container">
                <Test />
                <EDHDeckModal />
            </div>
        </section>
    );
}

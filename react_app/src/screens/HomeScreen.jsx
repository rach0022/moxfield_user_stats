import React from 'react';
import Test from "../components/Test.jsx";
import EDHDeckModal from "../components/UserStats/EDHDeckModal";
import AppHeader from "../components/Home/AppHeader";
import AppFooter from "../components/Home/AppFooter";
import UserSearchForm from "../components/UserStats/UserSearchForm";

export default function HomeScreen() {
    return (
        <>
            <AppHeader />
            <section className="section" id="main_section">
                <div className="container">
                    <UserSearchForm />
                </div>
            </section>
            <AppFooter />
        </>
    );
}

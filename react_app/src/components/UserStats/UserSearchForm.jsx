import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { search } from '../../redux/actions/searchActions';
import { useCSRFToken } from "../../providers/CSRFTokenContextProvider";

export default function UserSearchForm({}) {
    const [userName, setUserName] = useState('');
    const [includeLandsValue, setIncludeLandsValue] = useState(false);
    const csrfToken = useCSRFToken();

    const dispatch = useDispatch();
    const { loading, data, error } = useSelector((state) => state.search);

    const handleSearch = () => {
        // Dispatch search action with the username from moxfield and if they are including lands in stats
        dispatch(search(userName, includeLandsValue, csrfToken));
    };

    // TODO: Show the results from Data and build the EDHDeckList and Card Recommendations
    console.log(data);

    return (
        <>
            <label className={'label'}>
                Moxfield Username
            </label>
            <div className={'field has-addons'}>
                <div className={'control is-expanded'}>
                    <input
                        type="text"
                        className={'input'}
                        value={userName}
                        onChange={(e) => setUserName(e.target.value)}
                        placeholder="Search by Moxfield Username"
                    />
                </div>
                <div className={'control'}>
                    <button
                        className={`button is-info ${(loading) ? 'is-loading' : ''}`}
                        disabled={loading}
                        onClick={handleSearch}
                    >
                        Search
                    </button>
                </div>
            </div>

            <label className={'checkbox'}>
                Include Lands
                <input
                    type="checkbox"
                    checked={includeLandsValue}
                    onChange={(e) => setIncludeLandsValue(e.target.checked)}
                />
            </label>
            {error && <p style={{ color: 'red' }}>{error}</p>}
            {data && <div>
                {/* Render your search results here */}
            </div>}
        </>
    );
};

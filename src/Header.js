import React from 'react';
import AuthorDetails from './AuthorDetails';

const Header = ({title}) => {
    return <div className='header'>
        <h1>{title}</h1>
        <AuthorDetails/>
    </div>;
};

export default Header;
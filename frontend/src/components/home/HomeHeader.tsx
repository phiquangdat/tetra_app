import React from 'react';
import Header from '../ui/Header';

const navLinks = [
  { label: 'Home', href: '/' },
  { label: 'About', href: '/about' },
  { label: 'Features', href: '/features' },
  { label: 'Contact', href: '/contact' },
];

const HomeHeader = () => {
    return (
        <Header></Header>
    )
}

export default HomeHeader;

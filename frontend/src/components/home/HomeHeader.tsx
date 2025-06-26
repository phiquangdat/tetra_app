import Header, { type NavLink } from '../ui/Header';

const navLinks: NavLink[] = [
  { label: 'Home', href: '/' },
  { label: 'About', href: '/about' },
  { label: 'Features', href: '/features' },
  { label: 'Contact', href: '/contact' },
];

const HomeHeader = () => {
  return (
    <Header
      navLinks={navLinks}
      ctaButton={{ label: 'Login', href: '/login' }}
    />
  );
};

export default HomeHeader;

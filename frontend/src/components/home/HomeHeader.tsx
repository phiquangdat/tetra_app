import Header, { type NavLink } from '../ui/Header';

const navLinks: NavLink[] = [
  { label: 'Home', href: '/' },
  { label: 'About', href: '/about' },
  { label: 'Features', href: '/features' },
  { label: 'Contact', href: '/contact' },
];

const HomeHeader = ({ onLoginClick }: { onLoginClick?: () => void }) => {
  return (
    <Header
      navLinks={navLinks}
      ctaButton={{ label: 'Login', href: '/login', onClick: onLoginClick }}
    />
  );
};

export default HomeHeader;

import Header, { type NavLink } from '../ui/Header';

const navLinks: NavLink[] = [
  { label: 'Home', href: '/' },
  { label: 'About', href: '/about' },
  { label: 'Features', href: '/features' },
  { label: 'Contact', href: '/contact' },
];

const SharedHeader = () => <Header navLinks={navLinks} showHamburger={true} />;

export default SharedHeader;

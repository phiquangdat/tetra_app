import Header, { type NavLink } from '../ui/Header';

const navLinks: NavLink[] = [
  { label: 'Home', href: '/' },
  { label: 'About', href: '/about' },
  { label: 'Features', href: '/features' },
  { label: 'Contact', href: '/contact' },
];

interface SharedHeaderProps {
  onHamburgerClick: () => void;
  isSidebarOpen: boolean;
}

const SharedHeader = ({
  onHamburgerClick,
  isSidebarOpen,
}: SharedHeaderProps) => (
  <Header
    navLinks={navLinks}
    showHamburger={true}
    onHamburgerClick={onHamburgerClick}
    isSidebarOpen={isSidebarOpen}
  />
);

export default SharedHeader;

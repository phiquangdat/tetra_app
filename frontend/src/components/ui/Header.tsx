import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { HamburgerIcon, CloseIcon } from '../common/Icons';
import TetraLogo from '../../assets/logos/TETRA-APP.png';

export type NavLink = { label: string; href: string };
type CTAButton = { label: string; href: string; onClick?: () => void };

interface HeaderProps {
  navLinks: NavLink[];
  ctaButton?: CTAButton;
  showHamburger?: boolean;
  onHamburgerClick?: () => void;
  isSidebarOpen?: boolean;
}

const sectionMap: Record<string, string> = {
  '/': 'home',
  '/about': 'about',
  '/features': 'features',
  '/contact': 'contact',
};

function scrollToSection(section: string) {
  if (section === 'home') {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    return;
  }
  const el = document.getElementById(section);
  if (el) {
    el.scrollIntoView({ behavior: 'smooth' });
  }
}

const Header: React.FC<HeaderProps> = ({
  navLinks,
  ctaButton,
  showHamburger = false,
  onHamburgerClick,
  isSidebarOpen,
}) => {
  const location = useLocation();
  const navigate = useNavigate();

  const handleNavClick = (e: React.MouseEvent, href: string) => {
    e.preventDefault();
    const hash = href.startsWith('/') ? href : `/${href}`;
    const section = sectionMap[hash] || hash.replace('/', '');

    if (location.pathname === '/') {
      // Already on homepage: smooth scroll
      scrollToSection(section);
      window.history.replaceState(
        null,
        '',
        section === 'home' ? '/' : `/#${section}`,
      );
    } else {
      // Navigate to homepage with hash, then scroll after navigation
      navigate(section === 'home' ? '/' : `/#${section}`);
      setTimeout(() => {
        scrollToSection(section);
      }, 100); // Delay to allow page render
    }
  };

  return (
    <header className="flex items-center justify-between px-10 h-16 bg-[#231942]">
      <div className="flex items-center min-w-[220px]">
        {showHamburger && (
          <button
            onClick={onHamburgerClick}
            className="mr-4 focus:outline-none"
            aria-label="Toggle menu"
          >
            {isSidebarOpen ? (
              <CloseIcon width={30} height={30} color="#998FC7" />
            ) : (
              <HamburgerIcon />
            )}
          </button>
        )}

        <button
          onClick={(e) => handleNavClick(e, '/')}
          className="flex items-center gap-2 cursor-pointer focus:outline-none"
        >
          <img
            src={TetraLogo}
            alt="Tetra Logo"
            className="h-10 w-auto mr-2"
            style={{ objectFit: 'contain' }}
          />
          <span className="font-bold text-3xl text-white tracking-wide">
            TETRA
          </span>
        </button>
      </div>
      <nav className="flex flex-1 justify-center">
        <ul className="flex gap-9 list-none m-0 p-0">
          {navLinks.map((link) => (
            <li key={link.label}>
              <a
                href={link.href}
                onClick={(e) => handleNavClick(e, link.href)}
                className="no-underline text-white font-medium text-xl hover:text-[#998FC7] transition-colors duration-200"
              >
                {link.label}
              </a>
            </li>
          ))}
        </ul>
      </nav>
      {ctaButton && (
        <a
          href={ctaButton.href}
          className="bg-[#FFA726] text-white font-bold text-lg px-7 py-2 rounded-lg no-underline shadow-sm border-0 transition-colors duration-200 hover:bg-[#FFB74D]"
          onClick={(e) => {
            if (ctaButton.onClick) {
              e.preventDefault();
              ctaButton.onClick();
            }
          }}
        >
          {ctaButton.label}
        </a>
      )}
    </header>
  );
};

export default Header;

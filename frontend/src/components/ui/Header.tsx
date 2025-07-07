import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { HamburgerIcon, LogoIcon, CloseIcon } from '../common/Icons';

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
    <header className="flex items-center justify-between px-10 border-b-2 border-blue-500 bg-slate-50 h-16">
      <div className="flex items-center min-w-[220px]">
        {showHamburger && (
          <button
            onClick={onHamburgerClick}
            className="mr-4 focus:outline-none"
            aria-label="Toggle menu"
          >
            {isSidebarOpen ? (
              <CloseIcon className="w-6 h-6 text-blue-900" />
            ) : (
              <HamburgerIcon className="w-6 h-6 text-blue-900" />
            )}
          </button>
        )}

        <LogoIcon />
        <span className="font-bold text-2xl text-blue-900 tracking-wide">
          Gamify learning
        </span>
      </div>
      <nav className="flex flex-1 justify-center">
        <ul className="flex gap-9 list-none m-0 p-0">
          {navLinks.map((link) => (
            <li key={link.label}>
              <a
                href={link.href}
                className="no-underline text-blue-900 font-medium text-xl"
                onClick={(e) => handleNavClick(e, link.href)}
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
          className="bg-indigo-100 text-blue-900 font-bold text-lg px-7 py-2 rounded-lg no-underline shadow-sm border-0 transition-colors duration-200 hover:bg-indigo-200"
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

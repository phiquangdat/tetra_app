import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

export type NavLink = { label: string; href: string };
type CTAButton = { label: string; href: string };

interface HeaderProps {
  navLinks: NavLink[];
  ctaButton?: CTAButton;
  showHamburger?: boolean;
  onHamburgerClick?: () => void;
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
}) => {
  const location = useLocation();
  const navigate = useNavigate();

  const handleNavClick = (e: React.MouseEvent, href: string) => {
    e.preventDefault();
    const hash = href.startsWith('/') ? href : `/${href}`;
    const section = sectionMap[hash] || hash.replace('/', '');

    if (location.pathname === '/') {
      scrollToSection(section);
      window.history.replaceState(
        null,
        '',
        section === 'home' ? '/' : `/#${section}`,
      );
    } else {
      navigate(section === 'home' ? '/' : `/#${section}`);
      setTimeout(() => {
        scrollToSection(section);
      }, 100);
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
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path
                d="M3 6h18M3 12h18M3 18h18"
                stroke="#998FC7"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          </button>
        )}

        <svg
          width="36"
          height="36"
          viewBox="0 0 36 36"
          fill="none"
          className="mr-3"
        >
          <rect
            x="3"
            y="5"
            width="30"
            height="26"
            rx="8"
            stroke="#998FC7"
            strokeWidth="2"
          />
          <path
            d="M12 18l5 5 7-9"
            stroke="#998FC7"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>

        <span className="font-extrabold text-2xl text-white tracking-wide">
          Gamify learning
        </span>
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
        >
          {ctaButton.label}
        </a>
      )}
    </header>
  );
};

export default Header;

import React from 'react';
const navLinks = [
  { label: 'Home', href: '/' },
  { label: 'About', href: '/about' },
  { label: 'Features', href: '/features' },
  { label: 'Contact', href: '/contact' }
];

const Header: React.FC = () => (
  <header className="flex items-center justify-between px-10 border-b-2 border-blue-500 bg-slate-50 h-16">
    <div className="flex items-center min-w-[220px]">
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
          stroke="#3B82F6"
          strokeWidth="2"
        />
        <path
          d="M12 18l5 5 7-9"
          stroke="#3B82F6"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
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
            >
              {link.label}
            </a>
          </li>
        ))}
      </ul>
    </nav>
    <a
      href="/login"
      className="bg-indigo-100 text-blue-900 font-bold text-lg px-7 py-2 rounded-lg no-underline shadow-sm border-0 transition-colors duration-200 hover:bg-indigo-200"
    >
      Login
    </a>
  </header>
);

export default Header;

import React from 'react';
import { Mail, Globe, Linkedin } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer
      id="contact"
      className="bg-[#231942] text-white p-8 md:p-12 shadow-lg"
    >
      <div className="container mx-auto ml-4">
        <h2 className="text-3xl md:text-4xl font-bold mb-6">Contacts</h2>
        <div className="flex flex-col space-y-4">
          <div className="flex items-center space-x-3">
            <Mail className="w-6 h-6 text-[#998FC7]" />
            <a
              href="mailto:me@vamk.fi"
              className="text-lg hover:text-[#998FC7] transition-colors"
            >
              me@vamk.fi
            </a>
          </div>
          <div className="flex items-center space-x-3">
            <Globe className="w-6 h-6 text-[#998FC7]" />
            <a
              href="https://vamk.fi"
              target="_blank"
              rel="noopener noreferrer"
              className="text-lg hover:text-[#998FC7] transition-colors"
            >
              vamk.fi
            </a>
          </div>
          <div className="flex items-center space-x-3">
            <Linkedin className="w-6 h-6 text-[#998FC7]" />
            <a
              href="https://www.linkedin.com/in/yourprofile"
              target="_blank"
              rel="noopener noreferrer"
              className="text-lg hover:text-[#998FC7] transition-colors"
            >
              LinkedIn
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

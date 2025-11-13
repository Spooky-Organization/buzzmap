import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Home, Mail, Shield, FileText, HelpCircle, ExternalLink } from 'lucide-react';
import { ROUTES } from '@/utils/constants';
import { ContactModal } from '@/components/modals/ContactModal';

export const Footer = () => {
  const currentYear = new Date().getFullYear();
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);

  return (
    <>
      <footer className="bg-white border-t border-gray-200 mt-auto">
        <div className="container-custom max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Main Footer Content */}
          <div className="py-8 md:py-12">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-6 lg:gap-8">
              {/* Brand Section */}
              <div className="sm:col-span-2 lg:col-span-1">
                <Link
                  to={ROUTES.HOME}
                  className="flex items-center gap-2 mb-4 group"
                >
                  <div className="h-8 w-8 rounded-lg bg-primary-100 flex items-center justify-center group-hover:bg-primary-200 transition-colors">
                    <Home className="h-5 w-5 text-primary-600" />
                  </div>
                  <span className="text-xl font-bold text-gray-900">ATemplate</span>
                </Link>
                <p className="text-sm text-gray-600 mb-4 leading-relaxed">
                  A production-ready authentication template with secure user management, 
                  multi-factor authentication, and role-based access control.
                </p>
                <div className="flex flex-wrap gap-2">
                  <a
                    href="https://www.spookielabsinc.site"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-sm text-primary-600 hover:text-primary-700 transition-colors"
                  >
                    <span>SpookieLabsInc</span>
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              </div>

              {/* Quick Links */}
              <div>
                <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4">
                  Quick Links
                </h3>
                <ul className="space-y-3">
                  <li>
                    <Link
                      to={ROUTES.HOME}
                      className="text-sm text-gray-600 hover:text-primary-600 transition-colors flex items-center gap-2"
                    >
                      <Home className="h-4 w-4" />
                      Home
                    </Link>
                  </li>
                  <li>
                    <Link
                      to={ROUTES.LOGIN}
                      className="text-sm text-gray-600 hover:text-primary-600 transition-colors"
                    >
                      Login
                    </Link>
                  </li>
                  <li>
                    <Link
                      to={ROUTES.REGISTER}
                      className="text-sm text-gray-600 hover:text-primary-600 transition-colors"
                    >
                      Register
                    </Link>
                  </li>
                  <li>
                    <button
                      onClick={() => setIsContactModalOpen(true)}
                      className="text-sm text-gray-600 hover:text-primary-600 transition-colors flex items-center gap-2"
                    >
                      <HelpCircle className="h-4 w-4" />
                      Support
                    </button>
                  </li>
                </ul>
              </div>

              {/* Legal */}
              <div>
                <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4">
                  Legal
                </h3>
                <ul className="space-y-3">
                  <li>
                    <Link
                      to={ROUTES.PRIVACY}
                      className="text-sm text-gray-600 hover:text-primary-600 transition-colors flex items-center gap-2"
                    >
                      <Shield className="h-4 w-4" />
                      Privacy Policy
                    </Link>
                  </li>
                  <li>
                    <Link
                      to={ROUTES.TERMS}
                      className="text-sm text-gray-600 hover:text-primary-600 transition-colors flex items-center gap-2"
                    >
                      <FileText className="h-4 w-4" />
                      Terms of Service
                    </Link>
                  </li>
                </ul>
              </div>

              {/* Contact */}
              <div>
                <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4">
                  Contact
                </h3>
                <ul className="space-y-3">
                  <li>
                    <button
                      onClick={() => setIsContactModalOpen(true)}
                      className="text-sm text-gray-600 hover:text-primary-600 transition-colors flex items-center gap-2"
                    >
                      <Mail className="h-4 w-4" />
                      Get in Touch
                    </button>
                  </li>
                  <li>
                    <a
                      href="https://www.spookielabsinc.site"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-gray-600 hover:text-primary-600 transition-colors flex items-center gap-2"
                    >
                      <span>Visit Website</span>
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="border-t border-gray-200 py-6">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <p className="text-sm text-gray-600 text-center sm:text-left">
                © {currentYear} <strong className="text-gray-900">Matthew Makundi</strong>, Founder{' '}
                <a
                  href="https://www.spookielabsinc.site"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary-600 hover:text-primary-700 transition-colors font-medium"
                >
                  SpookieLabsInc
                </a>
                . All rights reserved.
              </p>
            </div>
          </div>
        </div>
      </footer>

      <ContactModal
        isOpen={isContactModalOpen}
        onClose={() => setIsContactModalOpen(false)}
      />
    </>
  );
};


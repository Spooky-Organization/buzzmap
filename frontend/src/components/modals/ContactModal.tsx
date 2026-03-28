import { X, Mail, Linkedin, Briefcase, Building2, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ContactModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ContactModal = ({ isOpen, onClose }: ContactModalProps) => {
  if (!isOpen) return null;

  const contactLinks = [
    {
      label: 'Email',
      value: 'info@spookielabsinc.site',
      href: 'mailto:info@spookielabsinc.site',
      icon: <Mail className="h-6 w-6" />,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      hoverBg: 'hover:bg-blue-100',
    },
    {
      label: 'LinkedIn',
      value: 'Connect on LinkedIn',
      href: 'https://www.linkedin.com/in/matthew-makundi',
      icon: <Linkedin className="h-6 w-6" />,
      color: 'text-blue-700',
      bgColor: 'bg-blue-50',
      hoverBg: 'hover:bg-blue-100',
      external: true,
    },
    {
      label: 'Personal Portfolio',
      value: 'View my work',
      href: 'https://matthewmakundi.spookielabsinc.site',
      icon: <Briefcase className="h-6 w-6" />,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      hoverBg: 'hover:bg-purple-100',
      external: true,
    },
    {
      label: 'Company Portfolio',
      value: 'SpookieLabsInc',
      href: 'https://www.spookielabsinc.site',
      icon: <Building2 className="h-6 w-6" />,
      color: 'text-primary-600',
      bgColor: 'bg-primary-50',
      hoverBg: 'hover:bg-primary-100',
      external: true,
    },
  ];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50 backdrop-blur-sm transition-opacity"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto transform transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-primary-600 to-primary-700 text-white p-6 rounded-t-2xl flex items-center justify-between z-10">
          <div>
            <h2 className="text-2xl font-bold">Get in Touch</h2>
            <p className="text-primary-100 text-sm mt-1">Let's connect and collaborate</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/20 rounded-lg transition-colors"
            aria-label="Close modal"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-8">
          {/* Illustration Section */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-primary-100 to-primary-200 rounded-full mb-4">
              <Mail className="h-12 w-12 text-primary-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Matthew Makundi
            </h3>
            <p className="text-gray-600">
              Founder at SpookieLabsInc
            </p>
          </div>

          {/* Contact Links */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            {contactLinks.map((link, index) => (
              <a
                key={index}
                href={link.href}
                target={link.external ? '_blank' : undefined}
                rel={link.external ? 'noopener noreferrer' : undefined}
                className={`
                  ${link.bgColor}
                  ${link.hoverBg}
                  p-6 rounded-xl border-2 border-transparent hover:border-gray-200
                  transition-all duration-200 group cursor-pointer
                `}
              >
                <div className="flex items-start gap-4">
                  <div className={`${link.color} flex-shrink-0 group-hover:scale-110 transition-transform`}>
                    {link.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-gray-900 mb-1">{link.label}</h4>
                    <p className={`text-sm ${link.color} break-words flex items-center gap-1`}>
                      {link.value}
                      {link.external && (
                        <ExternalLink className="h-3 w-3 inline-block opacity-60" />
                      )}
                    </p>
                  </div>
                </div>
              </a>
            ))}
          </div>

          {/* Additional Info */}
          <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
            <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
              <Briefcase className="h-5 w-5 text-primary-600" />
              Available for
            </h4>
            <div className="flex flex-wrap gap-2">
              <span className="px-3 py-1 bg-white rounded-full text-sm text-gray-700 border border-gray-200">
                Web Development
              </span>
              <span className="px-3 py-1 bg-white rounded-full text-sm text-gray-700 border border-gray-200">
                Full-Stack Solutions
              </span>
              <span className="px-3 py-1 bg-white rounded-full text-sm text-gray-700 border border-gray-200">
                Consulting
              </span>
              <span className="px-3 py-1 bg-white rounded-full text-sm text-gray-700 border border-gray-200">
                Project Collaboration
              </span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 p-6 bg-gray-50 rounded-b-2xl">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-600">
              Prefer email? Click the email link above or copy{' '}
              <code className="px-2 py-1 bg-white rounded text-xs font-mono border border-gray-200">
              info@spookielabsinc.site
              </code>
            </p>
            <Button variant="ghost" size="sm" onClick={onClose}>
              Close
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};


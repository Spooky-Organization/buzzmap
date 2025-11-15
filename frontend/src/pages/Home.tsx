import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Shield,
  Lock,
  UserCheck,
  LogIn,
  ChevronRight,
  BookOpen,
  Code,
  Database,
  Server,
  Globe,
  ArrowRight,
  CheckCircle,
  Zap,
  Users,
  BarChart3,
  Sparkles,
  TrendingUp,
  Award,
  Github,
  FileText,
  Layers,
  Cpu,
  Network,
  Activity,
  Terminal,
  Package,
  Key,
  Mail,
  Clock,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Copy,
  Play,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Footer } from '@/components/layout/Footer';
import { MarkdownViewer } from '@/components/docs/MarkdownViewer';
import { ROUTES } from '@/utils/constants';
import { isAuthenticated, getCurrentUser } from '@/utils/sessionCheck';
import { AutoSEO } from '@/components/seo/SEO';
import { OrganizationStructuredData, WebsiteStructuredData } from '@/components/seo/StructuredData';

interface DocFile {
  name: string;
  path: string;
  description: string;
  icon: React.ReactNode;
}

export const Home = () => {
  const navigate = useNavigate();
  const [copyrightYear, setCopyrightYear] = useState(new Date().getFullYear());
  const [selectedDoc, setSelectedDoc] = useState<{ content: string; title: string } | null>(null);
  const [isLoadingDoc, setIsLoadingDoc] = useState(false);
  const [isAuthenticatedUser, setIsAuthenticatedUser] = useState(false);
  const [currentUser, setCurrentUser] = useState<{ firstName: string; lastName: string; email: string } | null>(null);

  useEffect(() => {
    // Update copyright year dynamically
    setCopyrightYear(new Date().getFullYear());
    
    // Check authentication status
    const authStatus = isAuthenticated();
    setIsAuthenticatedUser(authStatus);
    
    if (authStatus) {
      const user = getCurrentUser();
      if (user) {
        setCurrentUser({
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
        });
      }
    }
  }, []);

  const docs: DocFile[] = [
    {
      name: 'API Documentation',
      path: '/docs/API_DOCUMENTATION.md',
      description: 'Complete API endpoint reference and usage guide',
      icon: <Code className="h-5 w-5" />,
    },
    {
      name: 'Frontend README',
      path: '/docs/FRONTEND_README.md',
      description: 'Frontend setup, structure, and development guide',
      icon: <Globe className="h-5 w-5" />,
    },
    {
      name: 'Backend README',
      path: '/docs/README.md',
      description: 'Backend architecture, structure, and module organization',
      icon: <Server className="h-5 w-5" />,
    },
    {
      name: 'Environment Setup',
      path: '/docs/ENVIRONMENT_SETUP.md',
      description: 'Complete environment configuration and setup guide',
      icon: <Database className="h-5 w-5" />,
    },
    {
      name: 'Docker Setup',
      path: '/docs/DOCKER_SETUP.md',
      description: 'Docker configuration and deployment instructions',
      icon: <Server className="h-5 w-5" />,
    },
    {
      name: 'Authentication Fixes',
      path: '/docs/Authentication_Fixes.md',
      description: 'Authentication-related fixes and improvements documentation',
      icon: <Shield className="h-5 w-5" />,
    },
  ];

  const handleDocClick = async (docPath: string, docName: string) => {
    setIsLoadingDoc(true);
    try {
      const filename = docPath.split('/').pop() || docPath.split('/docs/').pop() || docName;
      
      const pathsToTry = [
        `/docs/${filename}`,
        `../docs/${filename}`,
        `../../docs/${filename}`,
        docPath,
      ];

      let markdown = '';
      let found = false;

      for (const path of pathsToTry) {
        try {
          const response = await fetch(path, {
            headers: {
              Accept: 'text/markdown, text/plain, */*',
            },
          });
          
          if (response.ok) {
            markdown = await response.text();
            found = true;
            break;
          }
        } catch (error) {
          continue;
        }
      }

      if (!found || !markdown) {
        alert(
          `Unable to load ${docName}. Please ensure the document is available in the /docs folder or configure your server to serve markdown files.`
        );
        setIsLoadingDoc(false);
        return;
      }

      setSelectedDoc({
        content: markdown,
        title: docName,
      });
    } catch (error) {
      console.error('Error loading document:', error);
      alert('Failed to load document. Please check the file path and server configuration.');
    } finally {
      setIsLoadingDoc(false);
    }
  };

  const features = [
    {
      icon: <Shield className="h-6 w-6" />,
      title: 'JWT Authentication',
      description: 'Token-based auth with automatic refresh, secure storage, XSS protection',
      bgColor: 'bg-blue-50',
      iconBg: 'bg-blue-100',
      iconColor: 'text-blue-600',
    },
    {
      icon: <Lock className="h-6 w-6" />,
      title: 'Multi-Factor Authentication',
      description: 'TOTP-based 2FA with backup codes, QR code generation',
      bgColor: 'bg-purple-50',
      iconBg: 'bg-purple-100',
      iconColor: 'text-purple-600',
    },
    {
      icon: <UserCheck className="h-6 w-6" />,
      title: 'Role-Based Access Control',
      description: 'Flexible RBAC with USER, ACCOUNTANT, and ADMIN roles',
      bgColor: 'bg-green-50',
      iconBg: 'bg-green-100',
      iconColor: 'text-green-600',
    },
    {
      icon: <Code className="h-6 w-6" />,
      title: 'API Versioning',
      description: 'Versioned API endpoints (/api/v1) with backward compatibility',
      bgColor: 'bg-indigo-50',
      iconBg: 'bg-indigo-100',
      iconColor: 'text-indigo-600',
    },
    {
      icon: <Activity className="h-6 w-6" />,
      title: 'Performance Monitoring',
      description: 'Built-in performance metrics and monitoring',
      bgColor: 'bg-yellow-50',
      iconBg: 'bg-yellow-100',
      iconColor: 'text-yellow-600',
    },
    {
      icon: <Package className="h-6 w-6" />,
      title: 'Docker Support',
      description: 'Complete Docker setup for dev and production environments',
      bgColor: 'bg-cyan-50',
      iconBg: 'bg-cyan-100',
      iconColor: 'text-cyan-600',
    },
    {
      icon: <Key className="h-6 w-6" />,
      title: 'TypeScript',
      description: 'Full TypeScript support with strict mode',
      bgColor: 'bg-blue-50',
      iconBg: 'bg-blue-100',
      iconColor: 'text-blue-600',
    },
    {
      icon: <Database className="h-6 w-6" />,
      title: 'Modern Stack',
      description: 'React 18, Express, PostgreSQL, Redis, Prisma',
      bgColor: 'bg-orange-50',
      iconBg: 'bg-orange-100',
      iconColor: 'text-orange-600',
    },
  ];

  const stats = [
    { label: 'Security Features', value: '10+', icon: <Shield className="h-5 w-5" /> },
    { label: 'API Endpoints', value: '30+', icon: <Code className="h-5 w-5" /> },
    { label: 'User Roles', value: '3', icon: <Users className="h-5 w-5" /> },
    { label: 'Documentation Pages', value: '6+', icon: <BookOpen className="h-5 w-5" /> },
  ];

  const benefits = [
    {
      icon: <Zap className="h-5 w-5" />,
      title: 'Production Ready',
      description: 'Built with enterprise-grade security and best practices',
    },
    {
      icon: <TrendingUp className="h-5 w-5" />,
      title: 'Scalable Architecture',
      description: 'Designed to grow with your application needs',
    },
    {
      icon: <Award className="h-5 w-5" />,
      title: 'OWASP Compliant',
      description: 'Follows OWASP Top 10 security guidelines',
    },
    {
      icon: <Sparkles className="h-5 w-5" />,
      title: 'Developer Friendly',
      description: 'Well-documented codebase with TypeScript support',
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-primary-50 via-white to-secondary-50">
      <AutoSEO />
      <OrganizationStructuredData />
      <WebsiteStructuredData />
      {/* Hero Section - Enhanced */}
      <div className="relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-secondary-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
        </div>

        <div className="relative container-custom max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
          {/* Welcome Message for Authenticated Users */}
          {isAuthenticatedUser && currentUser && (
            <div className="mb-8">
              <Card variant="elevated" padding="md" className="bg-gradient-to-r from-primary-500 to-primary-600 text-white border-0">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                      <CheckCircle className="h-6 w-6" />
                    </div>
                    <div>
                      <p className="text-sm opacity-90">Welcome back!</p>
                      <p className="text-lg font-semibold">
                        {currentUser.firstName} {currentUser.lastName}
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="secondary"
                    size="md"
                    onClick={() => navigate(ROUTES.DASHBOARD)}
                    className="bg-white text-primary-600 hover:bg-gray-50"
                  >
                    Go to Dashboard
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </div>
              </Card>
            </div>
          )}

          {/* Main Hero Content */}
          <div className="text-center mb-16">
            <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-primary-500 to-primary-600 rounded-2xl mb-6 shadow-lg transform hover:scale-105 transition-transform">
              <Shield className="h-12 w-12 text-white" />
            </div>
            
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-gray-900 mb-6 leading-tight">
              Production-Ready Authentication
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-secondary-600">
                Template for Modern Applications
              </span>
            </h1>
            
            <p className="text-xl md:text-2xl text-gray-600 max-w-4xl mx-auto mb-6 leading-relaxed">
              Open Source • TypeScript • Full-Stack • OWASP Compliant
            </p>
            
            <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto mb-10 leading-relaxed">
              Get a complete, secure, production-ready authentication system with JWT, MFA, RBAC, and comprehensive security features. 
              Built with React, Express, PostgreSQL, and Redis. Save weeks of development time.
            </p>

            {/* CTA Buttons */}
            {!isAuthenticatedUser ? (
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
                <Button
                  variant="primary"
                  size="lg"
                  icon={<BookOpen className="h-5 w-5" />}
                  onClick={() => {
                    const docSection = document.getElementById('documentation');
                    if (docSection) {
                      docSection.scrollIntoView({ behavior: 'smooth' });
                    }
                  }}
                  className="min-w-[180px] shadow-lg hover:shadow-xl transition-shadow"
                >
                  View Documentation
                </Button>
                <Button
                  variant="secondary"
                  size="lg"
                  icon={<LogIn className="h-5 w-5" />}
                  onClick={() => navigate(ROUTES.LOGIN)}
                  className="min-w-[180px] bg-white border-2 border-primary-600 text-primary-600 hover:bg-primary-50"
                >
                  Try Demo
                </Button>
              </div>
            ) : (
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
                <Button
                  variant="primary"
                  size="lg"
                  icon={<BarChart3 className="h-5 w-5" />}
                  onClick={() => navigate(ROUTES.DASHBOARD)}
                  className="min-w-[180px] shadow-lg hover:shadow-xl transition-shadow"
                >
                  View Dashboard
                </Button>
                <Button
                  variant="secondary"
                  size="lg"
                  icon={<BookOpen className="h-5 w-5" />}
                  onClick={() => {
                    const docSection = document.getElementById('documentation');
                    if (docSection) {
                      docSection.scrollIntoView({ behavior: 'smooth' });
                    }
                  }}
                  className="min-w-[180px] bg-white border-2 border-primary-600 text-primary-600 hover:bg-primary-50"
                >
                  Documentation
                </Button>
              </div>
            )}

            {/* Stats Section */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
              {stats.map((stat, index) => (
                <div
                  key={index}
                  className="bg-white/80 backdrop-blur-sm rounded-xl p-4 border border-gray-200 shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center justify-center w-10 h-10 bg-primary-100 rounded-lg text-primary-600 mb-3 mx-auto">
                    {stat.icon}
                  </div>
                  <div className="text-2xl font-bold text-gray-900 mb-1">{stat.value}</div>
                  <div className="text-xs text-gray-600">{stat.label}</div>
                </div>
              ))}
            </div>
            
            {/* Tech Stack Badges */}
            <div className="flex flex-wrap items-center justify-center gap-3 mt-8">
              <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">TypeScript</span>
              <span className="px-3 py-1 bg-cyan-100 text-cyan-700 rounded-full text-sm font-medium">React 18</span>
              <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">Express</span>
              <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-medium">PostgreSQL</span>
              <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm font-medium">Redis</span>
              <span className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-sm font-medium">Docker</span>
            </div>
          </div>
        </div>
      </div>

      {/* Problem/Solution Section */}
      <div className="bg-white py-16">
        <div className="container-custom max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Problem */}
            <Card variant="outlined" padding="lg" className="border-red-200 bg-red-50/50">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center text-red-600">
                  <AlertTriangle className="h-6 w-6" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">The Problem</h2>
              </div>
              <p className="text-gray-700 leading-relaxed mb-4">
                Building authentication from scratch is <span className="font-semibold">time-consuming</span> and <span className="font-semibold">error-prone</span>.
              </p>
              <ul className="space-y-2 text-gray-600">
                <li className="flex items-start gap-2">
                  <XCircle className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
                  <span>Weeks of development time lost on auth infrastructure</span>
                </li>
                <li className="flex items-start gap-2">
                  <XCircle className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
                  <span>Security vulnerabilities from incomplete implementations</span>
                </li>
                <li className="flex items-start gap-2">
                  <XCircle className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
                  <span>Reinventing the wheel instead of building features</span>
                </li>
                <li className="flex items-start gap-2">
                  <XCircle className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
                  <span>Maintenance burden of custom auth code</span>
                </li>
              </ul>
            </Card>

            {/* Solution */}
            <Card variant="outlined" padding="lg" className="border-green-200 bg-green-50/50">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center text-green-600">
                  <CheckCircle2 className="h-6 w-6" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">The Solution</h2>
              </div>
              <p className="text-gray-700 leading-relaxed mb-4">
                Get a <span className="font-semibold">complete, secure, production-ready</span> authentication system in minutes.
              </p>
              <ul className="space-y-2 text-gray-600">
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>Save weeks of development time</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>Enterprise-grade security out of the box</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>Focus on building your core features</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>Well-documented, maintainable codebase</span>
                </li>
              </ul>
            </Card>
          </div>
        </div>
      </div>

      {/* Features Section - Enhanced */}
      <div className="container-custom max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Key Features
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Everything you need for secure, scalable authentication
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {features.map((feature, index) => (
            <Card
              key={index}
              variant="elevated"
              padding="lg"
              className="group hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 border-2 border-transparent hover:border-primary-200"
            >
              <div className={`inline-flex items-center justify-center w-14 h-14 ${feature.iconBg} rounded-xl ${feature.iconColor} mb-4 group-hover:scale-110 transition-transform`}>
                {feature.icon}
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3 group-hover:text-primary-600 transition-colors">
                {feature.title}
              </h3>
              <p className="text-sm text-gray-600 leading-relaxed">{feature.description}</p>
            </Card>
          ))}
        </div>

      </div>

      {/* Tech Stack Section */}
      <div className="bg-gray-50 py-16">
        <div className="container-custom max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Built with Modern Technologies
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              A carefully selected tech stack for performance, security, and developer experience
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Frontend */}
            <Card variant="elevated" padding="lg" className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600 mx-auto mb-4">
                <Globe className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Frontend</h3>
              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex items-center justify-center gap-2">
                  <Code className="h-4 w-4" />
                  <span>React 18 + TypeScript</span>
                </div>
                <div className="flex items-center justify-center gap-2">
                  <Zap className="h-4 w-4" />
                  <span>Vite</span>
                </div>
                <div className="flex items-center justify-center gap-2">
                  <Sparkles className="h-4 w-4" />
                  <span>Tailwind CSS</span>
                </div>
                <div className="flex items-center justify-center gap-2">
                  <Network className="h-4 w-4" />
                  <span>React Router v6</span>
                </div>
                <div className="flex items-center justify-center gap-2">
                  <FileText className="h-4 w-4" />
                  <span>React Hook Form + Zod</span>
                </div>
              </div>
            </Card>

            {/* Backend */}
            <Card variant="elevated" padding="lg" className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-xl flex items-center justify-center text-green-600 mx-auto mb-4">
                <Server className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Backend</h3>
              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex items-center justify-center gap-2">
                  <Cpu className="h-4 w-4" />
                  <span>Node.js + Express</span>
                </div>
                <div className="flex items-center justify-center gap-2">
                  <Code className="h-4 w-4" />
                  <span>TypeScript</span>
                </div>
                <div className="flex items-center justify-center gap-2">
                  <Database className="h-4 w-4" />
                  <span>Prisma ORM</span>
                </div>
                <div className="flex items-center justify-center gap-2">
                  <Database className="h-4 w-4" />
                  <span>PostgreSQL</span>
                </div>
                <div className="flex items-center justify-center gap-2">
                  <Activity className="h-4 w-4" />
                  <span>Redis</span>
                </div>
              </div>
            </Card>

            {/* Security */}
            <Card variant="elevated" padding="lg" className="text-center">
              <div className="w-16 h-16 bg-red-100 rounded-xl flex items-center justify-center text-red-600 mx-auto mb-4">
                <Shield className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Security</h3>
              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex items-center justify-center gap-2">
                  <Key className="h-4 w-4" />
                  <span>JWT Tokens</span>
                </div>
                <div className="flex items-center justify-center gap-2">
                  <Lock className="h-4 w-4" />
                  <span>bcrypt</span>
                </div>
                <div className="flex items-center justify-center gap-2">
                  <Shield className="h-4 w-4" />
                  <span>DOMPurify</span>
                </div>
                <div className="flex items-center justify-center gap-2">
                  <Shield className="h-4 w-4" />
                  <span>Helmet</span>
                </div>
                <div className="flex items-center justify-center gap-2">
                  <Network className="h-4 w-4" />
                  <span>CORS Protection</span>
                </div>
              </div>
            </Card>

            {/* DevOps */}
            <Card variant="elevated" padding="lg" className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-xl flex items-center justify-center text-purple-600 mx-auto mb-4">
                <Package className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">DevOps</h3>
              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex items-center justify-center gap-2">
                  <Package className="h-4 w-4" />
                  <span>Docker</span>
                </div>
                <div className="flex items-center justify-center gap-2">
                  <Terminal className="h-4 w-4" />
                  <span>Docker Compose</span>
                </div>
                <div className="flex items-center justify-center gap-2">
                  <Server className="h-4 w-4" />
                  <span>Multi-stage Builds</span>
                </div>
                <div className="flex items-center justify-center gap-2">
                  <Mail className="h-4 w-4" />
                  <span>Resend API</span>
                </div>
                <div className="flex items-center justify-center gap-2">
                  <Activity className="h-4 w-4" />
                  <span>Health Checks</span>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>

      {/* Benefits Section */}
      <div className="container-custom max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="bg-gradient-to-r from-primary-50 to-secondary-50 rounded-2xl p-8 md:p-12 mb-16">
          <div className="text-center mb-10">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Why Choose This Template?
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Built for developers who value security, scalability, and best practices
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {benefits.map((benefit, index) => (
              <div key={index} className="text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-white rounded-xl text-primary-600 mb-4 shadow-sm">
                  {benefit.icon}
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">{benefit.title}</h3>
                <p className="text-sm text-gray-600">{benefit.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Architecture Overview Section */}
      <div className="bg-white py-16">
        <div className="container-custom max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-100 rounded-2xl text-primary-600 mb-6">
              <Layers className="h-8 w-8" />
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Modular Architecture
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Clean, maintainable code structure designed for scalability and easy customization
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Backend Architecture */}
            <Card variant="elevated" padding="lg">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center text-green-600">
                  <Server className="h-6 w-6" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900">Backend</h3>
              </div>
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Module-Based Structure</h4>
                  <p className="text-sm text-gray-600 mb-3">
                    Self-contained <code className="bg-gray-100 px-2 py-0.5 rounded">auth_module</code> pattern for easy maintenance and potential extraction
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Core Components</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• <code className="bg-gray-100 px-1.5 py-0.5 rounded">core/</code> - Express app configuration</li>
                    <li>• <code className="bg-gray-100 px-1.5 py-0.5 rounded">auth_module/src/</code> - Authentication logic</li>
                    <li>• <code className="bg-gray-100 px-1.5 py-0.5 rounded">prisma/</code> - Database schema & migrations</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">API Versioning</h4>
                  <p className="text-sm text-gray-600">
                    Versioned routes (<code className="bg-gray-100 px-1.5 py-0.5 rounded">/api/v1</code>) with backward compatibility support
                  </p>
                </div>
              </div>
            </Card>

            {/* Frontend Architecture */}
            <Card variant="elevated" padding="lg">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600">
                  <Globe className="h-6 w-6" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900">Frontend</h3>
              </div>
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Singleton Patterns</h4>
                  <p className="text-sm text-gray-600 mb-3">
                    Centralized API Client, Session Manager, and Token Manager for consistency
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Component Structure</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• <code className="bg-gray-100 px-1.5 py-0.5 rounded">components/ui/</code> - Reusable UI components</li>
                    <li>• <code className="bg-gray-100 px-1.5 py-0.5 rounded">components/layout/</code> - Layout components</li>
                    <li>• <code className="bg-gray-100 px-1.5 py-0.5 rounded">pages/</code> - Page components</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">State Management</h4>
                  <p className="text-sm text-gray-600">
                    Session-based state with automatic token refresh and secure storage
                  </p>
                </div>
              </div>
            </Card>
          </div>

          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card variant="outlined" padding="md" className="text-center">
              <Database className="h-8 w-8 text-primary-600 mx-auto mb-3" />
              <h4 className="font-semibold text-gray-900 mb-2">Database</h4>
              <p className="text-sm text-gray-600">Prisma ORM with PostgreSQL, automated migrations</p>
            </Card>
            <Card variant="outlined" padding="md" className="text-center">
              <Activity className="h-8 w-8 text-primary-600 mx-auto mb-3" />
              <h4 className="font-semibold text-gray-900 mb-2">Caching</h4>
              <p className="text-sm text-gray-600">Redis for sessions, rate limiting, and performance</p>
            </Card>
            <Card variant="outlined" padding="md" className="text-center">
              <Network className="h-8 w-8 text-primary-600 mx-auto mb-3" />
              <h4 className="font-semibold text-gray-900 mb-2">Communication</h4>
              <p className="text-sm text-gray-600">RESTful API with consistent response formats</p>
            </Card>
          </div>
        </div>
      </div>

      {/* Security Highlights Section */}
      <div className="bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50 py-16">
        <div className="container-custom max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-2xl text-red-600 mb-6">
              <Shield className="h-8 w-8" />
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Enterprise-Grade Security
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              OWASP Top 10 compliant with comprehensive security measures
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            <Card variant="elevated" padding="lg" className="border-2 border-red-200">
              <div className="flex items-center gap-3 mb-4">
                <Award className="h-6 w-6 text-red-600" />
                <h3 className="text-lg font-semibold text-gray-900">OWASP Compliant</h3>
              </div>
              <p className="text-sm text-gray-600 mb-3">All 10 OWASP Top 10 categories addressed</p>
              <ul className="text-xs text-gray-600 space-y-1">
                <li>• Injection protection</li>
                <li>• Broken authentication prevention</li>
                <li>• XSS protection</li>
                <li>• Secure access control</li>
              </ul>
            </Card>

            <Card variant="elevated" padding="lg" className="border-2 border-orange-200">
              <div className="flex items-center gap-3 mb-4">
                <Lock className="h-6 w-6 text-orange-600" />
                <h3 className="text-lg font-semibold text-gray-900">Authentication Security</h3>
              </div>
              <p className="text-sm text-gray-600 mb-3">Multiple layers of authentication protection</p>
              <ul className="text-xs text-gray-600 space-y-1">
                <li>• Password hashing (bcrypt with salt)</li>
                <li>• JWT tokens with refresh rotation</li>
                <li>• Multi-factor authentication (TOTP)</li>
                <li>• Secure token storage</li>
              </ul>
            </Card>

            <Card variant="elevated" padding="lg" className="border-2 border-yellow-200">
              <div className="flex items-center gap-3 mb-4">
                <Activity className="h-6 w-6 text-yellow-600" />
                <h3 className="text-lg font-semibold text-gray-900">Rate Limiting</h3>
              </div>
              <p className="text-sm text-gray-600 mb-3">Multi-tier rate limiting system</p>
              <ul className="text-xs text-gray-600 space-y-1">
                <li>• General API: 100/15min</li>
                <li>• Auth endpoints: 5/15min</li>
                <li>• Password reset: 3/hour</li>
                <li>• Redis-backed protection</li>
              </ul>
            </Card>

            <Card variant="elevated" padding="lg" className="border-2 border-green-200">
              <div className="flex items-center gap-3 mb-4">
                <Shield className="h-6 w-6 text-green-600" />
                <h3 className="text-lg font-semibold text-gray-900">Input Sanitization</h3>
              </div>
              <p className="text-sm text-gray-600 mb-3">Comprehensive XSS protection</p>
              <ul className="text-xs text-gray-600 space-y-1">
                <li>• DOMPurify sanitization</li>
                <li>• HTML entity encoding</li>
                <li>• Script tag filtering</li>
                <li>• Parameterized queries</li>
              </ul>
            </Card>

            <Card variant="elevated" padding="lg" className="border-2 border-blue-200">
              <div className="flex items-center gap-3 mb-4">
                <Network className="h-6 w-6 text-blue-600" />
                <h3 className="text-lg font-semibold text-gray-900">Security Headers</h3>
              </div>
              <p className="text-sm text-gray-600 mb-3">Helmet middleware with comprehensive headers</p>
              <ul className="text-xs text-gray-600 space-y-1">
                <li>• X-Frame-Options</li>
                <li>• X-Content-Type-Options</li>
                <li>• X-XSS-Protection</li>
                <li>• CORS protection</li>
              </ul>
            </Card>

            <Card variant="elevated" padding="lg" className="border-2 border-purple-200">
              <div className="flex items-center gap-3 mb-4">
                <Clock className="h-6 w-6 text-purple-600" />
                <h3 className="text-lg font-semibold text-gray-900">Session Management</h3>
              </div>
              <p className="text-sm text-gray-600 mb-3">Secure session handling</p>
              <ul className="text-xs text-gray-600 space-y-1">
                <li>• Automatic token refresh</li>
                <li>• Redis session storage</li>
                <li>• Session timeout handling</li>
                <li>• Secure logout</li>
              </ul>
            </Card>
          </div>
        </div>
      </div>

      {/* Documentation Section - Enhanced */}
      <div id="documentation" className="container-custom max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="flex flex-col md:flex-row items-center justify-between mb-10">
          <div className="flex items-center gap-4 mb-4 md:mb-0">
            <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center text-primary-600">
              <BookOpen className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-4xl font-bold text-gray-900">Documentation</h2>
              <p className="text-gray-600 mt-1">Comprehensive guides and references</p>
            </div>
          </div>
        </div>

        <p className="text-gray-600 mb-8 max-w-3xl text-lg">
          Comprehensive documentation covering architecture, setup, API reference, and security best practices.
        </p>

        {/* Documentation Categories */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Getting Started</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            {docs.filter(doc => doc.name === 'Environment Setup' || doc.name === 'Docker Setup').map((doc, index) => (
              <Card
                key={index}
                variant="default"
                padding="lg"
                className={`hover:shadow-xl transition-all duration-300 cursor-pointer group border-2 border-transparent hover:border-primary-200 transform hover:-translate-y-1 ${
                  isLoadingDoc ? 'opacity-50 cursor-wait' : ''
                }`}
                onClick={() => !isLoadingDoc && handleDocClick(doc.path, doc.name)}
              >
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-primary-100 to-primary-200 rounded-xl flex items-center justify-center text-primary-600 group-hover:scale-110 transition-transform">
                    {doc.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 mb-2 group-hover:text-primary-600 transition-colors text-lg">
                      {doc.name}
                    </h3>
                    <p className="text-sm text-gray-600 mb-4 leading-relaxed">{doc.description}</p>
                    <div className="flex items-center text-sm font-medium text-primary-600 group-hover:text-primary-700">
                      <span>View Document</span>
                      <ChevronRight className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          <h3 className="text-lg font-semibold text-gray-900 mb-4">API Reference</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            {docs.filter(doc => doc.name === 'API Documentation').map((doc, index) => (
              <Card
                key={index}
                variant="default"
                padding="lg"
                className={`hover:shadow-xl transition-all duration-300 cursor-pointer group border-2 border-transparent hover:border-primary-200 transform hover:-translate-y-1 ${
                  isLoadingDoc ? 'opacity-50 cursor-wait' : ''
                }`}
                onClick={() => !isLoadingDoc && handleDocClick(doc.path, doc.name)}
              >
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-primary-100 to-primary-200 rounded-xl flex items-center justify-center text-primary-600 group-hover:scale-110 transition-transform">
                    {doc.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 mb-2 group-hover:text-primary-600 transition-colors text-lg">
                      {doc.name}
                    </h3>
                    <p className="text-sm text-gray-600 mb-4 leading-relaxed">{doc.description}</p>
                    <div className="flex items-center text-sm font-medium text-primary-600 group-hover:text-primary-700">
                      <span>View Document</span>
                      <ChevronRight className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          <h3 className="text-lg font-semibold text-gray-900 mb-4">Architecture & Security</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {docs.filter(doc => doc.name !== 'Environment Setup' && doc.name !== 'Docker Setup' && doc.name !== 'API Documentation').map((doc, index) => (
              <Card
                key={index}
                variant="default"
                padding="lg"
                className={`hover:shadow-xl transition-all duration-300 cursor-pointer group border-2 border-transparent hover:border-primary-200 transform hover:-translate-y-1 ${
                  isLoadingDoc ? 'opacity-50 cursor-wait' : ''
                }`}
                onClick={() => !isLoadingDoc && handleDocClick(doc.path, doc.name)}
              >
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-primary-100 to-primary-200 rounded-xl flex items-center justify-center text-primary-600 group-hover:scale-110 transition-transform">
                    {doc.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 mb-2 group-hover:text-primary-600 transition-colors text-lg">
                      {doc.name}
                    </h3>
                    <p className="text-sm text-gray-600 mb-4 leading-relaxed">{doc.description}</p>
                    <div className="flex items-center text-sm font-medium text-primary-600 group-hover:text-primary-700">
                      <span>View Document</span>
                      <ChevronRight className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Legacy Grid (keeping for backward compatibility) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 hidden">
          {docs.map((doc, index) => (
            <Card
              key={index}
              variant="default"
              padding="lg"
              className={`hover:shadow-xl transition-all duration-300 cursor-pointer group border-2 border-transparent hover:border-primary-200 transform hover:-translate-y-1 ${
                isLoadingDoc ? 'opacity-50 cursor-wait' : ''
              }`}
              onClick={() => !isLoadingDoc && handleDocClick(doc.path, doc.name)}
            >
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-primary-100 to-primary-200 rounded-xl flex items-center justify-center text-primary-600 group-hover:scale-110 transition-transform">
                  {doc.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-900 mb-2 group-hover:text-primary-600 transition-colors text-lg">
                    {doc.name}
                  </h3>
                  <p className="text-sm text-gray-600 mb-4 leading-relaxed">{doc.description}</p>
                  <div className="flex items-center text-sm font-medium text-primary-600 group-hover:text-primary-700">
                    <span>View Document</span>
                    <ChevronRight className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Quick Start Section */}
      <div className="bg-gradient-to-br from-primary-50 to-secondary-50 py-16">
        <div className="container-custom max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-100 rounded-2xl text-primary-600 mb-6">
              <Play className="h-8 w-8" />
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Get Started in Minutes
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Quick setup guide to get your authentication system running
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card variant="elevated" padding="lg" className="text-center">
              <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center text-primary-600 mx-auto mb-4">
                <span className="text-2xl font-bold">1</span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-3">Clone Repository</h3>
              <div className="bg-gray-900 text-gray-100 p-3 rounded-lg text-sm font-mono text-left overflow-x-auto">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-400"># Clone the repository</span>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText('git clone <repository-url>');
                    }}
                    className="text-gray-400 hover:text-white"
                  >
                    <Copy className="h-4 w-4" />
                  </button>
                </div>
                <code>git clone &lt;repository-url&gt;</code>
              </div>
            </Card>

            <Card variant="elevated" padding="lg" className="text-center">
              <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center text-primary-600 mx-auto mb-4">
                <span className="text-2xl font-bold">2</span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-3">Set Environment Variables</h3>
              <div className="bg-gray-900 text-gray-100 p-3 rounded-lg text-sm font-mono text-left overflow-x-auto">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-400"># Copy example file</span>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText('cp .env.example .env');
                    }}
                    className="text-gray-400 hover:text-white"
                  >
                    <Copy className="h-4 w-4" />
                  </button>
                </div>
                <code>cp .env.example .env</code>
              </div>
            </Card>

            <Card variant="elevated" padding="lg" className="text-center">
              <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center text-primary-600 mx-auto mb-4">
                <span className="text-2xl font-bold">3</span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-3">Start with Docker</h3>
              <div className="bg-gray-900 text-gray-100 p-3 rounded-lg text-sm font-mono text-left overflow-x-auto">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-400"># Start services</span>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText('./dev.sh up --build');
                    }}
                    className="text-gray-400 hover:text-white"
                  >
                    <Copy className="h-4 w-4" />
                  </button>
                </div>
                <code>./dev.sh up --build</code>
              </div>
            </Card>

            <Card variant="elevated" padding="lg" className="text-center">
              <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center text-primary-600 mx-auto mb-4">
                <span className="text-2xl font-bold">4</span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-3">Access Application</h3>
              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex items-center justify-center gap-2">
                  <Globe className="h-4 w-4" />
                  <span>Frontend: localhost:3000</span>
                </div>
                <div className="flex items-center justify-center gap-2">
                  <Server className="h-4 w-4" />
                  <span>Backend: localhost:5000</span>
                </div>
                <div className="flex items-center justify-center gap-2">
                  <Database className="h-4 w-4" />
                  <span>Prisma Studio: localhost:5555</span>
                </div>
              </div>
            </Card>
          </div>

          <div className="mt-8 text-center">
            <Button
              variant="secondary"
              size="lg"
              icon={<BookOpen className="h-5 w-5" />}
              onClick={() => {
                const docSection = document.getElementById('documentation');
                if (docSection) {
                  docSection.scrollIntoView({ behavior: 'smooth' });
                }
              }}
            >
              View Full Setup Guide
            </Button>
          </div>
        </div>
      </div>

      {/* API Overview Section */}
      <div className="bg-white py-16">
        <div className="container-custom max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-100 rounded-2xl text-primary-600 mb-6">
              <Code className="h-8 w-8" />
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Comprehensive API
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              30+ RESTful endpoints with versioning, rate limiting, and consistent responses
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card variant="elevated" padding="lg" className="text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600 mx-auto mb-4">
                <UserCheck className="h-6 w-6" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Authentication</h3>
              <p className="text-2xl font-bold text-primary-600 mb-2">9</p>
              <p className="text-sm text-gray-600">Endpoints</p>
              <ul className="text-xs text-gray-600 mt-3 space-y-1 text-left">
                <li>• Register, Login, Logout</li>
                <li>• Password Reset</li>
                <li>• Email Verification</li>
                <li>• Token Refresh</li>
              </ul>
            </Card>

            <Card variant="elevated" padding="lg" className="text-center">
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center text-purple-600 mx-auto mb-4">
                <Lock className="h-6 w-6" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">MFA</h3>
              <p className="text-2xl font-bold text-primary-600 mb-2">8</p>
              <p className="text-sm text-gray-600">Endpoints</p>
              <ul className="text-xs text-gray-600 mt-3 space-y-1 text-left">
                <li>• Setup & Verify</li>
                <li>• Login Flow</li>
                <li>• Backup Codes</li>
                <li>• QR Code Generation</li>
              </ul>
            </Card>

            <Card variant="elevated" padding="lg" className="text-center">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center text-green-600 mx-auto mb-4">
                <Users className="h-6 w-6" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">User Management</h3>
              <p className="text-2xl font-bold text-primary-600 mb-2">7</p>
              <p className="text-sm text-gray-600">Endpoints</p>
              <ul className="text-xs text-gray-600 mt-3 space-y-1 text-left">
                <li>• CRUD Operations</li>
                <li>• Role Management</li>
                <li>• User Statistics</li>
                <li>• Admin Features</li>
              </ul>
            </Card>

            <Card variant="elevated" padding="lg" className="text-center">
              <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center text-orange-600 mx-auto mb-4">
                <Activity className="h-6 w-6" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Performance</h3>
              <p className="text-2xl font-bold text-primary-600 mb-2">4</p>
              <p className="text-sm text-gray-600">Endpoints</p>
              <ul className="text-xs text-gray-600 mt-3 space-y-1 text-left">
                <li>• Metrics & Stats</li>
                <li>• Endpoint Monitoring</li>
                <li>• System Summary</li>
                <li>• Health Checks</li>
              </ul>
            </Card>
          </div>

          <div className="text-center">
            <Button
              variant="primary"
              size="lg"
              icon={<FileText className="h-5 w-5" />}
              onClick={() => {
                const apiDoc = docs.find(d => d.name === 'API Documentation');
                if (apiDoc) {
                  handleDocClick(apiDoc.path, apiDoc.name);
                }
              }}
            >
              View Complete API Documentation
            </Button>
          </div>
        </div>
      </div>

      {/* What's Included Section */}
      <div className="bg-gray-50 py-16">
        <div className="container-custom max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-100 rounded-2xl text-primary-600 mb-6">
              <Package className="h-8 w-8" />
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              What's Included
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Complete feature set ready for production use
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card variant="elevated" padding="lg">
              <div className="flex items-center gap-3 mb-4">
                <UserCheck className="h-6 w-6 text-primary-600" />
                <h3 className="text-xl font-semibold text-gray-900">Authentication</h3>
              </div>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>User Registration & Login</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>Password Reset & Recovery</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>Email Verification</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>Change Password</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>Secure Logout</span>
                </li>
              </ul>
            </Card>

            <Card variant="elevated" padding="lg">
              <div className="flex items-center gap-3 mb-4">
                <Lock className="h-6 w-6 text-primary-600" />
                <h3 className="text-xl font-semibold text-gray-900">Multi-Factor Auth</h3>
              </div>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>MFA Setup & Configuration</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>TOTP Code Verification</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>MFA Login Flow</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>Backup Codes</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>QR Code Generation</span>
                </li>
              </ul>
            </Card>

            <Card variant="elevated" padding="lg">
              <div className="flex items-center gap-3 mb-4">
                <Users className="h-6 w-6 text-primary-600" />
                <h3 className="text-xl font-semibold text-gray-900">User Management</h3>
              </div>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>User CRUD Operations</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>Role Management (Admin)</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>User Statistics & Analytics</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>Resend Verification Email</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>Admin Dashboard</span>
                </li>
              </ul>
            </Card>

            <Card variant="elevated" padding="lg">
              <div className="flex items-center gap-3 mb-4">
                <Globe className="h-6 w-6 text-primary-600" />
                <h3 className="text-xl font-semibold text-gray-900">Frontend Pages</h3>
              </div>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>13+ Fully Implemented Pages</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>Role-Based Dashboards</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>Profile & Settings</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>Admin User Management</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>Responsive Design</span>
                </li>
              </ul>
            </Card>

            <Card variant="elevated" padding="lg">
              <div className="flex items-center gap-3 mb-4">
                <Code className="h-6 w-6 text-primary-600" />
                <h3 className="text-xl font-semibold text-gray-900">Backend Integration</h3>
              </div>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>API Client with Interceptors</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>Session Management</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>Token Refresh Automation</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>Route Guards</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>Error Handling</span>
                </li>
              </ul>
            </Card>

            <Card variant="elevated" padding="lg">
              <div className="flex items-center gap-3 mb-4">
                <Shield className="h-6 w-6 text-primary-600" />
                <h3 className="text-xl font-semibold text-gray-900">Security Features</h3>
              </div>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>OWASP Top 10 Compliant</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>Rate Limiting (Multi-tier)</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>Input Sanitization</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>Security Headers</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>XSS Protection</span>
                </li>
              </ul>
            </Card>
          </div>
        </div>
      </div>

      {/* Open Source Section */}
      <div className="bg-white py-16">
        <div className="container-custom max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Card variant="elevated" padding="lg" className="bg-gradient-to-br from-primary-50 to-secondary-50 border-2 border-primary-200">
            <div className="text-center max-w-4xl mx-auto">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-100 rounded-2xl text-primary-600 mb-6">
                <Github className="h-8 w-8" />
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Open Source & Free to Use
              </h2>
              <p className="text-lg text-gray-600 mb-6 leading-relaxed">
                This authentication template is open source and free to use in your projects. 
                Built with a modular architecture for easy customization and extension.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="text-center">
                  <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-primary-600 mx-auto mb-3 shadow-sm">
                    <Package className="h-6 w-6" />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">MIT License</h3>
                  <p className="text-sm text-gray-600">Free to use in commercial and personal projects</p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-primary-600 mx-auto mb-3 shadow-sm">
                    <Code className="h-6 w-6" />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">Fully Customizable</h3>
                  <p className="text-sm text-gray-600">Modular structure for easy modification</p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-primary-600 mx-auto mb-3 shadow-sm">
                    <FileText className="h-6 w-6" />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">Well Documented</h3>
                  <p className="text-sm text-gray-600">Comprehensive documentation and examples</p>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Button
                  variant="primary"
                  size="lg"
                  icon={<Github className="h-5 w-5" />}
                  onClick={() => {
                    window.open('https://github.com/Matthew-kabiu/Authentication-Template.git', '_blank', 'noopener,noreferrer');
                  }}
                >
                  View on GitHub
                </Button>
                <Button
                  variant="secondary"
                  size="lg"
                  icon={<BookOpen className="h-5 w-5" />}
                  onClick={() => {
                    const docSection = document.getElementById('documentation');
                    if (docSection) {
                      docSection.scrollIntoView({ behavior: 'smooth' });
                    }
                  }}
                >
                  Read Documentation
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* About Section - Enhanced */}
      <div className="container-custom max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <Card variant="elevated" padding="lg" className="bg-gradient-to-br from-gray-50 to-white border-2 border-gray-100">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-100 rounded-2xl text-primary-600 mb-6">
              <Sparkles className="h-8 w-8" />
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
              About This Template
            </h2>
            <p className="text-lg text-gray-600 mb-6 leading-relaxed">
              This authentication template provides a complete, production-ready solution for
              implementing secure user authentication in your applications. It includes everything
              you need: user registration, login, password reset, email verification, multi-factor
              authentication, and role-based access control.
            </p>
            <p className="text-lg text-gray-600 leading-relaxed">
              Built with security best practices, following{' '}
              <span className="font-semibold text-gray-900">OWASP Top 10</span> guidelines, and designed
              for scalability and maintainability. Perfect for startups, enterprises, and
              developers who need a robust authentication system without building from scratch.
            </p>
          </div>
        </Card>
      </div>

      {/* Footer */}
      <Footer />

      {/* Markdown Viewer Modal */}
      {selectedDoc && (
        <MarkdownViewer
          markdown={selectedDoc.content}
          title={selectedDoc.title}
          copyrightYear={copyrightYear}
          onClose={() => setSelectedDoc(null)}
        />
      )}
    </div>
  );
};

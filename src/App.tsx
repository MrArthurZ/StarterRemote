import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { Globe2, ShieldCheck, Settings as SettingsIcon, Briefcase, FileText, LogIn, LogOut, User as UserIcon } from 'lucide-react';
import { ThemeProvider } from './contexts/ThemeContext';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ThemeToggle } from './components/ThemeToggle';
import { Home } from './pages/Home';
import { Freelance } from './pages/Freelance';
import { Admin } from './pages/Admin';
import { Settings } from './pages/Settings';
import { GoogleTranslate } from './components/GoogleTranslate';
import { AuthModal } from './components/AuthModal';
import { useState } from 'react';

function Navigation() {
  const location = useLocation();
  
  return (
    <div className="flex items-center gap-1 sm:gap-4 bg-gray-100 dark:bg-gray-800/50 p-1 rounded-lg">
      <Link 
        to="/" 
        className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
          location.pathname === '/' 
            ? 'bg-white dark:bg-gray-700 text-indigo-600 dark:text-indigo-400 shadow-sm' 
            : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700/50'
        }`}
      >
        <Briefcase className="w-4 h-4" />
        <span className="hidden sm:inline-block">Remote Jobs</span>
      </Link>
      <Link 
        to="/freelance" 
        className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
          location.pathname === '/freelance' 
            ? 'bg-white dark:bg-gray-700 text-indigo-600 dark:text-indigo-400 shadow-sm' 
            : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700/50'
        }`}
      >
        <FileText className="w-4 h-4" />
        <span className="hidden sm:inline-block">Freelance Work</span>
      </Link>
    </div>
  );
}

function UserMenu() {
  const { user, signOut } = useAuth();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  if (user) {
    return (
      <div className="flex items-center gap-3">
        <div className="hidden sm:flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
          {user.photoURL ? (
            <img src={user.photoURL} alt={user.displayName || 'User'} className="w-6 h-6 rounded-full" referrerPolicy="no-referrer" />
          ) : (
            <div className="w-6 h-6 rounded-full bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
              <UserIcon className="w-4 h-4" />
            </div>
          )}
          <span className="max-w-[100px] truncate">{user.displayName || user.email}</span>
        </div>
        <button 
          onClick={() => signOut()}
          className="p-2 text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
          title="Sign Out"
        >
          <LogOut className="w-5 h-5" />
        </button>
      </div>
    );
  }

  return (
    <>
      <button 
        onClick={() => setIsAuthModalOpen(true)}
        className="flex items-center gap-2 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg transition-colors"
      >
        <LogIn className="w-4 h-4" />
        <span className="hidden sm:inline-block">Sign In</span>
      </button>
      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
    </>
  );
}

export default function App() {
  return (
    <HelmetProvider>
      <AuthProvider>
        <ThemeProvider>
          <Router>
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 font-sans selection:bg-indigo-100 dark:selection:bg-indigo-900/50 selection:text-indigo-900 dark:selection:text-indigo-100 flex flex-col transition-colors duration-200">
              {/* Header */}
              <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-10 transition-colors">
                <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                  <div className="flex items-center gap-6">
                    <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
                      <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
                        <Globe2 className="w-5 h-5 text-white" />
                      </div>
                      <h1 className="text-xl font-bold tracking-tight dark:text-white hidden md:block">StarterRemote</h1>
                    </Link>
                    <Navigation />
                  </div>
                  <div className="flex items-center gap-2 sm:gap-4">
                    <GoogleTranslate />
                    <ThemeToggle />
                    <Link to="/settings" className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors" aria-label="User Settings">
                      <SettingsIcon className="w-5 h-5" />
                    </Link>
                    <div className="w-px h-6 bg-gray-200 dark:bg-gray-700 mx-1"></div>
                    <UserMenu />
                  </div>
                </div>
              </header>

              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/freelance" element={<Freelance />} />
                <Route path="/settings" element={<Settings />} />
                <Route path="/admin-secret-dashboard" element={<Admin />} />
              </Routes>

              {/* Footer */}
              <footer className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 mt-auto py-8 transition-colors">
                <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-sm text-gray-500 dark:text-gray-400">
                  <p className="flex items-center justify-center gap-2 flex-wrap">
                    <ShieldCheck className="w-4 h-4 text-emerald-500 dark:text-emerald-400" />
                    Jobs are sourced directly from <strong>Jobicy, Arbeitnow, <a href="https://remoteok.com" target="_blank" rel="noopener noreferrer" className="text-indigo-600 dark:text-indigo-400 hover:underline">Remote OK</a>, The Muse, Remotive, and Freelancer.com</strong> — trusted, reliable, and 100% free remote job boards.
                  </p>
                  <p className="mt-2">Clicking a job will take you securely to the original application page.</p>
                </div>
              </footer>
            </div>
          </Router>
        </ThemeProvider>
      </AuthProvider>
    </HelmetProvider>
  );
}

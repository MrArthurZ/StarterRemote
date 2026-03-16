import { useState, useEffect, FormEvent } from 'react';
import { Helmet } from 'react-helmet-async';
import { auth, db } from '../firebase';
import { signInWithPopup, GoogleAuthProvider, signOut, onAuthStateChanged, User } from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { Loader2, ShieldAlert, LogOut, Settings } from 'lucide-react';

export function Admin() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [announcement, setAnnouncement] = useState('');
  const [announcementVisible, setAnnouncementVisible] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        try {
          // Check if user is admin
          const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
          const isUserAdmin = userDoc.exists() && userDoc.data().role === 'admin';
          // Also allow the initial bootstrapped admin
          const isBootstrappedAdmin = currentUser.email === 'arthur492lol@gmail.com' && currentUser.emailVerified;
          
          if (isUserAdmin || isBootstrappedAdmin) {
            setIsAdmin(true);
            // Ensure user doc exists for bootstrapped admin
            if (!userDoc.exists() && isBootstrappedAdmin) {
              await setDoc(doc(db, 'users', currentUser.uid), {
                email: currentUser.email,
                role: 'admin'
              });
            }
            
            // Load settings
            const settingsDoc = await getDoc(doc(db, 'settings', 'global'));
            if (settingsDoc.exists()) {
              setAnnouncement(settingsDoc.data().announcement || '');
              setAnnouncementVisible(settingsDoc.data().announcementVisible || false);
            }
          } else {
            setIsAdmin(false);
          }
        } catch (error) {
          console.error("Error checking admin status:", error);
          setIsAdmin(false);
        }
      } else {
        setIsAdmin(false);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleLogin = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error("Login failed:", error);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const handleSaveSettings = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');
    try {
      await setDoc(doc(db, 'settings', 'global'), {
        announcement,
        announcementVisible,
        updatedAt: serverTimestamp()
      }, { merge: true });
      setMessage('Settings saved successfully!');
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error("Failed to save settings:", error);
      setMessage('Failed to save settings. Check console.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Loader2 className="w-8 h-8 text-indigo-600 animate-spin mb-4" />
        <p className="text-gray-500 dark:text-gray-400 font-medium">Checking authentication...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="max-w-md mx-auto mt-20 p-8 bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 text-center">
        <Helmet><title>Admin Login | StarterRemote</title></Helmet>
        <ShieldAlert className="w-12 h-12 text-indigo-600 dark:text-indigo-400 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Admin Access</h2>
        <p className="text-gray-500 dark:text-gray-400 mb-6">Please sign in to access the admin dashboard.</p>
        <button
          onClick={handleLogin}
          className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-xl transition-colors"
        >
          Sign in with Google
        </button>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="max-w-md mx-auto mt-20 p-8 bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 text-center">
        <Helmet><title>Access Denied | StarterRemote</title></Helmet>
        <ShieldAlert className="w-12 h-12 text-red-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Access Denied</h2>
        <p className="text-gray-500 dark:text-gray-400 mb-6">You do not have permission to view this page.</p>
        <button
          onClick={handleLogout}
          className="py-2 px-4 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 font-medium rounded-lg transition-colors"
        >
          Sign out
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 w-full flex-1">
      <Helmet><title>Admin Dashboard | StarterRemote</title></Helmet>
      
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
          <Settings className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
          Admin Dashboard
        </h2>
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 py-2 px-4 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 font-medium rounded-lg transition-colors"
        >
          <LogOut className="w-4 h-4" />
          Sign out
        </button>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 border-b border-gray-100 dark:border-gray-700 pb-4">Site Settings</h3>
        
        <form onSubmit={handleSaveSettings} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Global Announcement Banner
            </label>
            <textarea
              value={announcement}
              onChange={(e) => setAnnouncement(e.target.value)}
              rows={3}
              className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:bg-white dark:focus:bg-gray-800 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 dark:focus:ring-indigo-900 transition-all outline-none dark:text-white"
              placeholder="Enter announcement text..."
            />
          </div>

          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="announcementVisible"
              checked={announcementVisible}
              onChange={(e) => setAnnouncementVisible(e.target.checked)}
              className="w-5 h-5 text-indigo-600 rounded border-gray-300 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700"
            />
            <label htmlFor="announcementVisible" className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Show announcement banner on homepage
            </label>
          </div>

          <div className="pt-4 border-t border-gray-100 dark:border-gray-700 flex items-center justify-between">
            {message && (
              <span className={`text-sm ${message.includes('Failed') ? 'text-red-600 dark:text-red-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
                {message}
              </span>
            )}
            <button
              type="submit"
              disabled={saving}
              className="ml-auto flex items-center gap-2 py-2.5 px-6 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-medium rounded-xl transition-colors"
            >
              {saving && <Loader2 className="w-4 h-4 animate-spin" />}
              Save Settings
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

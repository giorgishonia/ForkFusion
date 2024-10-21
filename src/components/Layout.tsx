'use client'

import Link from 'next/link';
import { Utensils, Home, BookOpen, User, LogOut } from 'lucide-react'; // Import icons
import { useAuth } from './AuthProvider';
import { signOut } from 'firebase/auth';
import { auth } from '@/app/firebase';
import Image from 'next/image';
import { useState } from 'react';

export default function Layout({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false); // State to control dropdown visibility

  const handleSignOut = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const toggleDropdown = () => {
    setDropdownOpen((prev) => !prev);
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 text-gray-900">
      <header className="bg-white shadow-sm">
        <nav className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between flex-wrap">
            <Link href="/" className="flex items-center text-gray-900 hover:text-gray-600 transition-colors">
              <Utensils className="mr-2" />
              <span className="text-xl font-bold">ForkFusion</span>
            </Link>
            <div className="flex items-center space-x-4">
              <Link href="/" className="flex items-center text-gray-600 hover:text-gray-900 transition-colors">
                <Home size={20} />
              </Link>
              <Link href="/categories" className="flex items-center text-gray-600 hover:text-gray-900 transition-colors">
                <BookOpen size={20} />
              </Link>
              {user ? (
                <div className="relative flex items-center">
                  <Link href="#" onClick={toggleDropdown} className="flex items-center text-gray-600 hover:text-gray-900 transition-colors">
                    {user.photoURL ? (
                      <Image src={user.photoURL} alt={user.displayName || 'User'} width={32} height={32} className="rounded-full" />
                    ) : (
                      <User size={20} />
                    )}
                    <span className="ml-2 hidden sm:block">{user.displayName?.split(' ')[0]}</span>
                  </Link>
                  {dropdownOpen && (
                    <div
                      className="absolute right-0 mt-2 w-32 bg-white border border-gray-200 rounded-lg shadow-lg z-10"
                      style={{ transform: 'translate(10px, 60px)' }} // Adjusted dropdown positioning
                    >
                      <Link href="/profile" className="flex items-center block px-3 py-2 text-gray-700 hover:bg-gray-100 text-[16px]">
                        <User size={18} className="mr-2" />
                        Profile
                      </Link>
                      <button
                        onClick={handleSignOut}
                        className="block w-full text-left px-3 py-2 text-[16px] text-gray-700 hover:bg-gray-100"
                      >
                        <LogOut className="inline mr-2" size={18} />
                        Log Out
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <Link href="/login" className="text-gray-600 hover:text-gray-900 transition-colors">
                  Sign In
                </Link>
              )}
            </div>
          </div>
        </nav>
      </header>
      <main className="flex-grow container mx-auto px-4 py-8">
        {children}
      </main>
      <footer className="bg-white shadow-sm mt-8">
        <div className="container mx-auto px-4 py-4">
          <p className="text-center text-gray-600">&copy; 2023 ForkFusion. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

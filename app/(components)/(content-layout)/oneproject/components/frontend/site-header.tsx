"use client";
import React from "react";
import { useState, useEffect } from "react";
import { Dialog, DialogPanel } from "@headlessui/react";
import { Bars3Icon, XMarkIcon } from "@heroicons/react/24/outline";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../../components/ui/dropdown-menu";

import Link from "next/link";
import { Button } from "../../components/ui/button";
import { ModeToggle } from "../../components/mode-toggle";
import { Avatar, AvatarFallback, AvatarImage } from "../../components/ui/avatar";
import { getInitials } from "../../lib/generateInitials";
import { useRouter } from "next/navigation";
import Logo from "../../components/global/Logo";
import AuthenticatedAvatar from "../global/AuthenticatedAvatar";

type SafeUser = {
  id: string;
  role: string | null;
  email: string;
  username: string;
  avatarUrl: string;
};

export default function SiteHeader({ user }: { user: SafeUser | null }) {
  const navigation = [
    { name: "Özellikler", href: "/oneproject/#features" },
    { name: "Çözümler", href: "/oneproject/#solutions" },
    { name: "Kaynaklar", href: "/oneproject/resources" },
    { name: "Dökümanlar", href: "/oneproject/docs" },
    { name: "Fiyatlandırma", href: "/oneproject/pricing" },
  ];
  
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Scroll kontrolü için useEffect
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [mobileMenuOpen]);

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };

  return (
    <div className="w-full bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-b border-gray-200 dark:border-gray-800">
      {/* Desktop Navigation */}
      <div className="hidden lg:block w-full">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="h-16 flex items-center justify-between">
            {/* Logo Section */}
            <div className="flex-shrink-0">
              <Logo title="Project Pro" href="/oneproject" />
            </div>

            {/* Navigation Links - Center */}
            <div className="flex items-center justify-center flex-1 mx-8">
              <div className="flex items-center space-x-1">
                {navigation.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    className="px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md transition-colors"
                  >
                    {item.name}
                  </Link>
                ))}
              </div>
            </div>

            {/* Right Actions */}
            <div className="flex items-center space-x-4">
              <ModeToggle />
              {user ? (
                <AuthenticatedAvatar user={user} />
              ) : (
                <Button asChild variant="outline" className="ml-4">
                  <Link href="/">Giriş Yap</Link>
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      <div className="lg:hidden w-full">
        <div className="px-4 sm:px-6">
          <div className="h-16 flex items-center justify-between">
            {/* Logo */}
            <div className="flex-shrink-0">
              <Logo title="Project Pro" href="/oneproject" />
            </div>

            {/* Mobile Menu Button */}
            <div className="flex items-center space-x-4">
              <ModeToggle />
              <button
                type="button"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="inline-flex items-center justify-center p-2 rounded-md text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800"
                aria-label={mobileMenuOpen ? "Menüyü kapat" : "Menüyü aç"}
              >
                {mobileMenuOpen ? (
                  <XMarkIcon className="h-6 w-6" />
                ) : (
                  <Bars3Icon className="h-6 w-6" />
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dialog */}
      <Dialog 
        open={mobileMenuOpen} 
        onClose={setMobileMenuOpen}
        className="relative lg:hidden"
      >
        <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
        
        <div className="fixed inset-0 flex justify-end">
          <DialogPanel className="w-full max-w-sm bg-white dark:bg-gray-900 shadow-lg flex flex-col h-full">
            {/* Menu Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-800 shrink-0">
              <Logo href="/" labelShown={true} title="Emlak Pro" />
              <button
                type="button"
                onClick={closeMobileMenu}
                className="p-2 rounded-md text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800"
                aria-label="Menüyü kapat"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>

            {/* Menu Content - Scrollable area */}
            <div className="flex-1 min-h-0 overflow-hidden">
              <div className="h-full overflow-y-auto">
                <div className="px-4 py-6 space-y-2">
                  {navigation.map((item) => (
                    <Link
                      key={item.name}
                      href={item.href}
                      onClick={closeMobileMenu}
                      className="block px-4 py-3 text-base font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                    >
                      {item.name}
                    </Link>
                  ))}
                </div>
              </div>
            </div>

            {/* Menu Footer */}
            <div className="p-4 border-t border-gray-200 dark:border-gray-800 shrink-0">
              {user ? (
                <div className="space-y-4">
                  <div className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <Avatar>
                      <AvatarImage
                        src={user?.avatarUrl ?? ""}
                        alt={user?.username ?? ""}
                      />
                      <AvatarFallback>
                        {getInitials(user?.username)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                        {user?.username}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                        {user?.email}
                      </p>
                    </div>
                  </div>
                  <Button asChild variant="default" className="w-full">
                    <Link href="/dashboard" onClick={closeMobileMenu}>
                      Panel
                    </Link>
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  <Button asChild variant="outline" className="w-full">
                    <Link href="/" onClick={closeMobileMenu}>
                      Giriş Yap
                    </Link>
                  </Button>
                  <Button asChild variant="default" className="w-full">
                    <Link href="/register" onClick={closeMobileMenu}>
                      Kayıt Ol
                    </Link>
                  </Button>
                </div>
              )}
            </div>
          </DialogPanel>
        </div>
      </Dialog>
    </div>
  );
}
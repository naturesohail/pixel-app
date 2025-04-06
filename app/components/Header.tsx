"use client";
import Link from "next/link";
import { useState, useRef, useEffect } from "react";
import { FaUser, FaSignInAlt } from "react-icons/fa";
import { useAuth } from "@/app/context/AuthContext";

export default function Header() {
  const { isLoggedIn, user, logout } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null); // now div ref is correct

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="header-area header-sticky bg-white shadow-sm">
      <div className="container">
        <div className="row">
          <div className="col-12">
            <nav className="main-nav flex justify-between items-center py-3 px-4">
              <Link href="/" className="text-2xl font-bold text-black">
                MDC
              </Link>

              <ul className="nav flex items-center gap-6">
                <li>
                  <Link href="/products" className="hover:text-blue-600">
                    Auctions
                  </Link>
                </li>
                <li>
                  <Link href="/contact" className="hover:text-blue-600">
                    Contact Us
                  </Link>
                </li>

                {isLoggedIn ? (
                  <li className="relative">
                    <button
                      className="flex items-center space-x-2 hover:text-blue-600"
                      onClick={() => setDropdownOpen(!dropdownOpen)}
                    >
                      <FaUser size={20} />
                      <span>{user?.name?.split(" ")[0]}</span>
                    </button>

                    {dropdownOpen && (
                      <div
                        ref={dropdownRef}
                        className="absolute right-0 mt-2 w-40 bg-white border rounded-md shadow-lg z-10"
                      >
                        <Link
                          href="/profile"
                          className="block px-4 py-2 hover:bg-gray-100"
                          onClick={() => setDropdownOpen(false)}
                        >
                          Profile
                        </Link>
                        <button
                          onClick={() => {
                            logout();
                            setDropdownOpen(false);
                          }}
                          className="w-full text-left px-4 py-2 hover:bg-gray-100"
                        >
                          Logout
                        </button>
                      </div>
                    )}
                  </li>
                ) : (
                  <li>
                    <Link href="/login" title="Login" className="hover:text-blue-600">
                      <FaSignInAlt size={20} />
                    </Link>
                  </li>
                )}
              </ul>

              <button className="menu-trigger">
                <span>Menu</span>
              </button>
            </nav>
          </div>
        </div>
      </div>
    </header>
  );
}

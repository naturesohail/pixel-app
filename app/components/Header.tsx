// components/Header.tsx
"use client";
import Link from "next/link";
import { useState, useRef, useEffect } from "react";
import { FaUser, FaSignInAlt, FaCheckCircle } from "react-icons/fa";
import { useAuth } from "@/app/context/AuthContext";

type TourStep = {
  id: string;
  content: string;
  position: 'top' | 'bottom' | 'left' | 'right';
};

export default function Header() {

  const { isLoggedIn, user, logout, isLoading } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [showTour, setShowTour] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [tourSteps, setTourSteps] = useState<TourStep[]>([]);
  const loggedInStatusRef = useRef<HTMLSpanElement>(null);
  const loginLinkRef = useRef<HTMLAnchorElement>(null);
  const bidBuyLinkRef = useRef<HTMLAnchorElement>(null);
  const uploadPixelLinkRef = useRef<HTMLAnchorElement>(null);
  const auctionsLinkRef = useRef<HTMLAnchorElement>(null);
  const userDropdownButtonRef = useRef<HTMLButtonElement>(null);
  const refMap = useRef<Record<string, React.RefObject<HTMLElement | null>>>({});

  useEffect(() => {
    refMap.current = {
      'loggedInStatus': loggedInStatusRef,
      'loginLink': loginLinkRef,
      'bidBuyLink': bidBuyLinkRef,
      'uploadPixelLink': uploadPixelLinkRef,
      'auctionsLink': auctionsLinkRef,
      'userDropdown': userDropdownButtonRef,
    };
  }, []);

  useEffect(() => {
    setDropdownOpen(false);
  }, [isLoggedIn]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const hasSeenHeaderTour = localStorage.getItem('hasSeenHeaderTour_v4');

    if (!isLoading && !hasSeenHeaderTour) {
      let steps: TourStep[] = [];

      if (isLoggedIn) {
        steps.push({ id: 'loggedInStatus', content: 'You are logged in.', position: 'bottom' });
        steps.push({ id: 'userDropdown', content: 'Manage your profile and bids here.', position: 'bottom' });
      } else {
        steps.push({ id: 'loginLink', content: 'Login or register here.', position: 'bottom' });
        steps.push({ id: 'bidBuyLink', content: 'Explore bid/buy options.', position: 'bottom' });
        steps.push({ id: 'uploadPixelLink', content: 'Upload pixel info for auctions.', position: 'bottom' });
      }
      steps.push({ id: 'auctionsLink', content: 'View all auctions.', position: 'bottom' });

      if (steps.length > 0) {
        setTourSteps(steps);
        setCurrentStepIndex(0);
        setShowTour(true);
      }
    }
  }, [isLoading, isLoggedIn]);

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    if (showTour && tourSteps.length > 0) {
      timeoutId = setTimeout(() => {
        if (currentStepIndex < tourSteps.length - 1) {
          setCurrentStepIndex(prev => prev + 1);
        } else {
          setShowTour(false);
          localStorage.setItem('hasSeenHeaderTour_v4', 'true');
        }
      }, 3000);
    }

    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [showTour, currentStepIndex, tourSteps.length]);

  if (isLoading) {
    return <div className="header-area header-sticky bg-gray-100 shadow-sm">Loading...</div>;
  }

  const currentStep = tourSteps[currentStepIndex];
  const currentTargetElement = currentStep ? refMap.current[currentStep.id]?.current : null;

  return (
    <header className="header-area header-sticky bg-gradient-to-r from-gray-100 to-gray-200 shadow-md">
      <div className="container">
        <div className="row">
          <div className="col-12">
            <nav className="main-nav flex justify-between items-center py-1 px-4">
              <Link href="/" className="text-2xl font-bold text-gray-800 mt-3">
                AI Of World
              </Link>

              <ul className="nav flex items-center gap-6">
                <div className="bg-gradienb from-blue-600 to-grey-600 py-1">
                  <div className="container mx-auto">
                    
                 

                  </div>
                </div>

                {/* <li>
                  <Link ref={auctionsLinkRef} href="/auctions" className="hover:text-blue-600 text-gray-800 font-medium">
                    Auctions
                  </Link>
                </li> */}
                <li>
                  <Link href="/contact" className="hover:text-blue-600 text-gray-800 font-medium">
                    Contact Us
                  </Link>
                </li>

                {isLoggedIn ? (
                  <li className="relative">
                    <button
                      ref={userDropdownButtonRef}
                      className="flex items-center space-x-2 hover:text-blue-600 text-gray-800 font-medium"
                      onClick={() => setDropdownOpen(!dropdownOpen)}
                    >
                      <FaUser size={20} />
                      <span>{user?.name?.split(" ")[0] || 'User'}</span>
                    </button>

                    {dropdownOpen && (
                      <div
                        ref={dropdownRef}
                        className="absolute right-0 mt-2 w-40 bg-gray-100 border border-gray-300 rounded-md shadow-lg z-10"
                      >
                        <Link
                          href="/transactions"
                          className="block px-4 py-2 hover:bg-gray-200 text-gray-800"
                          onClick={() => setDropdownOpen(false)}
                        >
                          Transactions 
                        </Link>
                        <button
                          onClick={() => {
                            logout();
                            setDropdownOpen(false);
                          }}
                          className="w-full text-left px-4 py-2 hover:bg-gray-200 text-gray-800"
                        >
                          Logout
                        </button>
                      </div>
                    )}
                  </li>
                ) : (
                  <li className="mt-4">
                    <Link href="/login" title="Login" className="hover:text-blue-600 text-gray-800">
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

      {showTour && currentStep && currentTargetElement && (
        <div
          className="absolute border-3 border-blue-500 rounded-lg pointer-events-none transition-all duration-300 ease-in-out"
          style={{
            top: currentTargetElement.getBoundingClientRect().top + window.scrollY - 5,
            left: currentTargetElement.getBoundingClientRect().left + window.scrollX - 5,
            width: currentTargetElement.getBoundingClientRect().width + 10,
            height: currentTargetElement.getBoundingClientRect().height + 10,
            zIndex: 9999,
            boxShadow: '0 0 0 9999px rgba(0,0,0,0.3)',
          }}
        ></div>
      )}

    </header>
  );
}
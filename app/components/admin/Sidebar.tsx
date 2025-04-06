'use client';
import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  HomeIcon, 
  BriefcaseIcon,  
  WrenchScrewdriverIcon,  
  Cog8ToothIcon, 
  ChevronDownIcon,
  MagnifyingGlassIcon
} from '@heroicons/react/24/outline';
import clsx from 'clsx';
import Image from 'next/image';

export default function Sidebar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(true);
  const [isProjectsOpen, setIsProjectsOpen] = useState(false);

  const menuItems = [
    { name: 'Dashboard', icon: HomeIcon, path: '/admin/dashboard' },
    { 
      name: 'Products', 
      icon: BriefcaseIcon,  
      path: '/admin/products',
      subItems: [
        { name: 'Categories', icon: WrenchScrewdriverIcon, path: '/admin/categories' },
        { name: 'Products', path: '/admin/products' }, 
      ] 
    },
    { name: 'Queries', icon: MagnifyingGlassIcon, path: '/admin/queries' },
    { name: 'Bidders', icon: Cog8ToothIcon, path: '/admin/bidders' },
  ];

  return (
    <aside className={clsx(
      'fixed left-0 top-0 h-full bg-white shadow-lg transition-all duration-300',
      isOpen ? 'w-64' : 'w-20'
    )}>
      <div className="p-4">
        <h1 className={clsx(
          'font-bold text-gray-800 transition-all duration-300',
          isOpen ? 'text-2xl' : 'text-xl text-center'
        )}>
          {isOpen ? "Admin" : 'UA'}
        </h1>
      </div>

      <nav className="mt-8">
        {menuItems.map((item) => (
          <div key={item.name}>
            {item.subItems ? (
              <button 
               // ... existing code ...
               className={clsx(
                'flex items-center justify-between mb-2 w-full p-2 rounded-md transition-all text-gray-700', // Removed hover:bg-sky-200 for Projects tab
                isProjectsOpen && 'bg-gray-200'
              )}
                onClick={() => setIsProjectsOpen(!isProjectsOpen)}
              >
                <div className="flex items-center">
                  <item.icon className="w-6 h-6 text-gray-700" />
                  {isOpen && <span className="ml-2">{item.name}</span>}
                </div>
                {isOpen && (
                  <ChevronDownIcon 
                    className={clsx(
                      'w-5 h-5 transition-transform text-gray-700',
                      isProjectsOpen ? 'rotate-180' : 'rotate-0'
                    )} 
                  />
                )}
              </button>
            ) : (
              <Link
                href={item.path}
                className={clsx(
                  'flex items-center p-2 mb-2 rounded-md hover:bg-sky-200 transition-all text-gray-700',
                  pathname === item.path && 'bg-sky-300 text-gray-900'
                )}
              >
                <item.icon className="w-6 h-6 text-gray-700" />
                {isOpen && <span className="ml-2">{item.name}</span>}
              </Link>
            )}

            {isProjectsOpen && item.subItems && (
              <div className="ml-6">
                {item.subItems.map((subItem) => (
                  <Link
                    key={subItem.name}
                    href={subItem.path}
                    className={clsx(
                      'block p-2 rounded-md hover:bg-sky-200 transition-all text-gray-700',
                      pathname === subItem.path && 'bg-sky-300 text-gray-900'
                    )}
                  >
                    {isOpen && <span>{subItem.name}</span>}
                  </Link>
                ))}
              </div>
            )}
          </div>
        ))}
      </nav>
    </aside>
  );
}

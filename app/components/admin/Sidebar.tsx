'use client';
import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { 
  Squares2X2Icon,
  TagIcon, 
  CubeIcon,
  QuestionMarkCircleIcon,
  UserGroupIcon,
  ChevronDownIcon,
  BuildingOfficeIcon
} from '@heroicons/react/24/outline';
import clsx from 'clsx';
import { useAuth } from '@/app/context/AuthContext';

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(true);
  const [isPixelsOpen, setIsPixelsOpen] = useState(false);
  const { logout } = useAuth();

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  const menuItems = [
    { name: 'Dashboard', icon: Squares2X2Icon, path: '/admin/dashboard' },
    { name: 'Industries', icon: BuildingOfficeIcon, path: '/admin/industries' },
    { 
      name: 'Pixels', 
      icon: CubeIcon,  
      path: '/admin/pixels',
      subItems: [
        { name: 'Pixels', icon: CubeIcon, path: '/admin/pixels' }, 
      ] 
    },
    { name: 'Bidders', icon: UserGroupIcon, path: '/admin/bidders' },
    { name: 'Users', icon: UserGroupIcon, path: '/admin/users' },

    { name: 'Queries', icon: QuestionMarkCircleIcon, path: '/admin/queries' },
    { name: 'Settings', icon: TagIcon, path: '/admin/settings' },
    
  ];

  return (
    <aside className={clsx(
      'fixed left-0 top-0 h-full bg-white shadow-lg transition-all duration-300 z-10',
      isOpen ? 'w-64' : 'w-20'
    )}>
      <div className="p-4">
        <h1 className={clsx(
          'font-bold text-gray-800 transition-all duration-300 flex items-center',
          isOpen ? 'text-2xl' : 'text-xl justify-center'
        )}>
          {isOpen ? "Admin Panel" : 'AP'}
        </h1>
      </div>

      <nav className="mt-8 px-2">
        {menuItems.map((item) => (
          <div key={item.name}>
            {item.subItems ? (
              <div>
                <button 
                  className={clsx(
                    'flex items-center justify-between w-full p-3 rounded-md transition-all text-gray-700 hover:bg-gray-100',
                    isPixelsOpen && 'bg-gray-100'
                  )}
                  onClick={() => setIsPixelsOpen(!isPixelsOpen)}
                >
                  <div className="flex items-center">
                    <item.icon className="w-5 h-5" />
                    {isOpen && <span className="ml-3">{item.name}</span>}
                  </div>
                  {isOpen && (
                    <ChevronDownIcon 
                      className={clsx(
                        'w-4 h-4 transition-transform',
                        isPixelsOpen ? 'rotate-180' : ''
                      )} 
                    />
                  )}
                </button>

                {isPixelsOpen && (
                  <div className={clsx('ml-2 border-l-2 border-gray-200 pl-2', isOpen ? 'ml-8' : 'ml-4')}>
                    {item.subItems.map((subItem) => (
                      <Link
                        key={subItem.name}
                        href={subItem.path}
                        className={clsx(
                          'flex items-center p-2 my-1 rounded-md transition-all text-gray-700 hover:bg-gray-100',
                          pathname === subItem.path && 'bg-blue-100 text-blue-600'
                        )}
                      >
                        <subItem.icon className="w-4 h-4" />
                        {isOpen && <span className="ml-3 text-sm">{subItem.name}</span>}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <Link
                href={item.path}
                className={clsx(
                  'flex items-center p-3 my-1 rounded-md transition-all text-gray-700 hover:bg-gray-100',
                  pathname === item.path && 'bg-blue-100 text-blue-600'
                )}
              >
                <item.icon className="w-5 h-5" />
                {isOpen && <span className="ml-3">{item.name}</span>}
              </Link>
            )}
          </div>
        ))}

        {/* Logout button */}
        <button
          onClick={handleLogout}
          className="flex w-full items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
        >
          Logout
        </button>
      </nav>
    </aside>
  );
}

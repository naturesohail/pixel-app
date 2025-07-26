import { useState, useEffect, useRef } from "react";

interface DropdownMenuProps {
  buttonContent: React.ReactNode;
  children: React.ReactNode;
}

const DropdownMenu: React.FC<DropdownMenuProps> = ({ buttonContent, children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const toggleMenu = () => setIsOpen((prev) => !prev);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="absolute" ref={menuRef}>
      <button onClick={toggleMenu}>{buttonContent}</button>
      {isOpen && (
        <div className="origin-top-right absolute right-0 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none z-10">
          <div className="py-1">{children}</div>
        </div>
      )}
    </div>
  );
};

export default DropdownMenu;

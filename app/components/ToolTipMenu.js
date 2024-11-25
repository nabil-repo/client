import { useState, useEffect, useRef } from "react";

export default function TooltipMenu(data) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef(null);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = (event) => {
    if (menuRef.current && !menuRef.current.contains(event.target)) {
      setIsMenuOpen(false);
    }
  };

  useEffect(() => {
    // Add event listener to detect clicks outside the menu
    document.addEventListener("mousedown", closeMenu);
    return () => {
      // Cleanup the event listener
      document.removeEventListener("mousedown", closeMenu);
    };
  }, []);

  return (
    <div className="absolute" ref={menuRef}>
      {/* Trigger div (circle) */}
      <div
        className="w-10 h-10"
        onClick={toggleMenu}
      >
        <span className="text-white"></span> {/* Optional icon */}
      </div>

      {/* Tooltip Menu */}
      {isMenuOpen && (
        <div className="absolute mt-2 w-48 bg-white shadow-lg rounded-lg">
          <ul className="p-2">
            <li className="py-1 px-2 hover:bg-gray-200 cursor-pointer text-black">
              {data.username}
            </li>
            <li className="py-1 px-2 hover:bg-gray-200 cursor-pointer text-black">
              {data.id}
            </li>
          </ul>
        </div>
      )}
    </div>
  );
}

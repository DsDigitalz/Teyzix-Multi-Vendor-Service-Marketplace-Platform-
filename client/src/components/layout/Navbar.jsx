import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const NAV_LINKS = {
  customer: [
    { label: "Browse Services", to: "/services" },
    { label: "My Requests", to: "/dashboard/customer/requests" },
    { label: "Dashboard", to: "/dashboard/customer" },
  ],
  provider: [
    { label: "Browse Services", to: "/services" },
    { label: "My Listings", to: "/dashboard/provider/listings" },
    { label: "Dashboard", to: "/dashboard/provider" },
  ],
  admin: [
    { label: "Dashboard", to: "/dashboard/admin" },
    { label: "Users", to: "/dashboard/admin/users" },
  ],
};

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const links = isAuthenticated && user ? NAV_LINKS[user.role] || [] : [];

  const isActive = (to) => location.pathname === to;

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">T</span>
            </div>
            <span className="font-semibold text-gray-900 text-lg">Teyzix</span>
          </Link>

          {/* Desktop nav links */}
          <div className="hidden md:flex items-center gap-1">
            {links.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={`
                  px-3 py-2 rounded-lg text-sm font-medium transition-colors
                  ${
                    isActive(link.to)
                      ? "bg-blue-50 text-blue-600"
                      : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                  }
                `}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Right side */}
          <div className="hidden md:flex items-center gap-3">
            {isAuthenticated ? (
              <>
                <div className="flex items-center gap-2">
                  {user?.profilePic ? (
                    <img
                      src={user.profilePic}
                      alt={user.name}
                      className="w-8 h-8 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                      <span className="text-blue-600 text-sm font-semibold">
                        {user?.name?.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )}
                  <span className="text-sm text-gray-700 font-medium">
                    {user?.name}
                  </span>
                </div>
                <button
                  onClick={handleLogout}
                  className="px-3 py-2 text-sm text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-900"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
                >
                  Get Started
                </Link>
              </>
            )}
          </div>

          {/* Mobile hamburger */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-100"
          >
            {menuOpen ? (
              <svg
                className="w-5 h-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            ) : (
              <svg
                className="w-5 h-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            )}
          </button>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="md:hidden border-t border-gray-100 py-3 space-y-1 animate-in slide-in-from-top-2">
            {/* Public link always visible */}
            <Link
              to="/services"
              onClick={() => setMenuOpen(false)}
              className="block px-3 py-2.5 rounded-lg text-sm text-gray-700 hover:bg-gray-100 font-medium"
            >
              Browse Services
            </Link>

            {/* Role-based links */}
            {links.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                onClick={() => setMenuOpen(false)}
                className={`
          block px-3 py-2.5 rounded-lg text-sm font-medium transition-colors
          ${
            isActive(link.to)
              ? "bg-blue-50 text-blue-600"
              : "text-gray-600 hover:bg-gray-100"
          }
        `}
              >
                {link.label}
              </Link>
            ))}

            {/* Auth actions */}
            <div className="pt-2 mt-2 border-t border-gray-100">
              {isAuthenticated ? (
                <div>
                  <div className="flex items-center gap-2 px-3 py-2 mb-1">
                    <div className="w-7 h-7 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                      <span className="text-blue-600 text-xs font-bold">
                        {user?.name?.charAt(0)?.toUpperCase()}
                      </span>
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {user?.name}
                      </p>
                      <p className="text-xs text-gray-400 truncate">
                        {user?.email}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      handleLogout();
                      setMenuOpen(false);
                    }}
                    className="w-full text-left px-3 py-2.5 text-sm text-red-600
                       hover:bg-red-50 rounded-lg transition-colors"
                  >
                    Logout
                  </button>
                </div>
              ) : (
                <div className="space-y-1">
                  <Link
                    to="/login"
                    onClick={() => setMenuOpen(false)}
                    className="block px-3 py-2.5 text-sm text-gray-600 hover:bg-gray-100 rounded-lg"
                  >
                    Login
                  </Link>
                  <Link
                    to="/register"
                    onClick={() => setMenuOpen(false)}
                    className="block px-3 py-2.5 text-sm font-medium text-blue-600
                       bg-blue-50 hover:bg-blue-100 rounded-lg"
                  >
                    Get Started
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}

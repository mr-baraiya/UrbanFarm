import React, { useState } from "react";
import { createPortal } from "react-dom";
import { Link, NavLink } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import {
  RiHome4Line,
  RiShieldUserLine,
  RiLogoutBoxRLine,
  RiMenuLine,
  RiCloseLine,
  RiDashboardLine,
  RiPlantLine,
  RiSeedlingLine,
  RiMicroscopeLine,
  RiSparklingLine,
  RiDropLine,
  RiCalendarEventLine,
  RiTeamLine,
  RiUser3Line,
} from "react-icons/ri";
import "./Navbar.css";

const Navbar = () => {
  const { user, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  const sidebarLinks = [
    { to: "/app/dashboard", label: "Dashboard", icon: <RiDashboardLine /> },
    { to: "/app/gardens", label: "Gardens", icon: <RiPlantLine /> },
    { to: "/app/plants", label: "Plants", icon: <RiSeedlingLine /> },
    { to: "/app/diagnose", label: "Diagnose", icon: <RiMicroscopeLine /> },
    { to: "/app/crops", label: "Crop AI", icon: <RiSparklingLine /> },
    { to: "/app/watering", label: "Watering", icon: <RiDropLine /> },
    { to: "/app/schedule", label: "Schedule", icon: <RiCalendarEventLine /> },
    { to: "/app/community", label: "Community", icon: <RiTeamLine /> },
    { to: "/app/profile", label: "Profile", icon: <RiUser3Line /> },
  ];

  return (
    <nav className="navbar">
      <div className="navbar-left">
        <Link to="/app" className="logo">Urban Farm</Link>
        <Link to="/" className="nav-landing-link" title="Back to Home">
          <RiHome4Line />
          <span>Home</span>
        </Link>
        {user?.role === "admin" && (
          <Link to="/admin" className="nav-admin-link" title="Admin Control Panel">
            <RiShieldUserLine />
            <span>Admin Panel</span>
          </Link>
        )}
      </div>

      {/* Desktop right */}
      <div className="navbar-right">
        {user && (
          <>
            <span className="user-name">{user.name}</span>
            <button className="logout-btn" onClick={logout}>
              <RiLogoutBoxRLine />
              Sign out
            </button>
          </>
        )}
      </div>

      {/* Mobile hamburger */}
      {user && (
        <button
          className="mobile-toggle"
          onClick={() => setMenuOpen((o) => !o)}
          aria-label="Toggle menu"
        >
          {menuOpen ? <RiCloseLine /> : <RiMenuLine />}
        </button>
      )}

      {/* Render Backdrop & Mobile Drawer at document.body via Portal */}
      {user &&
        createPortal(
          <>
            {menuOpen && (
              <div
                className="mobile-nav-backdrop"
                onClick={() => setMenuOpen(false)}
              />
            )}
            <div className={`mobile-nav-drawer ${menuOpen ? "open" : ""}`}>
              <div className="mobile-nav-user-header">
                <span className="mobile-nav-user">{user.name}</span>
                <button
                  className="mobile-nav-close"
                  onClick={() => setMenuOpen(false)}
                  aria-label="Close menu"
                >
                  <RiCloseLine />
                </button>
              </div>

              <div className="mobile-nav-links">
                {sidebarLinks.map((link) => (
                  <NavLink
                    key={link.to}
                    to={link.to}
                    className={({ isActive }) =>
                      `mobile-nav-item ${isActive ? "active" : ""}`
                    }
                    onClick={() => setMenuOpen(false)}
                  >
                    <span className="icon">{link.icon}</span>
                    <span>{link.label}</span>
                  </NavLink>
                ))}
              </div>

              <div className="mobile-nav-extra-links">
                <Link
                  to="/"
                  className="mobile-nav-item"
                  onClick={() => setMenuOpen(false)}
                >
                  <span className="icon">
                    <RiHome4Line />
                  </span>
                  <span>Back to Home Page</span>
                </Link>
                {user.role === "admin" && (
                  <Link
                    to="/admin"
                    className="mobile-nav-item"
                    onClick={() => setMenuOpen(false)}
                  >
                    <span className="icon">
                      <RiShieldUserLine />
                    </span>
                    <span>Admin Control Panel</span>
                  </Link>
                )}
              </div>

              <div className="mobile-nav-footer">
                <button
                  className="mobile-nav-logout"
                  onClick={() => {
                    logout();
                    setMenuOpen(false);
                  }}
                >
                  <RiLogoutBoxRLine /> Sign out
                </button>
              </div>
            </div>
          </>,
          document.body
        )}
    </nav>
  );
};

export default Navbar;



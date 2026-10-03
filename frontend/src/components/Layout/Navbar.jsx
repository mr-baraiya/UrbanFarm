import React, { useState } from "react";
import { createPortal } from "react-dom";
import { Link, NavLink } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "../../hooks/useAuth";
import LanguageSelector from "../Common/LanguageSelector";
import { getLocalizedDynamicText } from "../../utils/localizationHelper";
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
  const { t, i18n } = useTranslation();
  const { user, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  const sidebarLinks = [
    { to: "/app/dashboard", label: t("navigation.dashboard"), icon: <RiDashboardLine /> },
    { to: "/app/gardens", label: t("navigation.gardens"), icon: <RiPlantLine /> },
    { to: "/app/plants", label: t("navigation.plants"), icon: <RiSeedlingLine /> },
    { to: "/app/diagnose", label: t("navigation.diagnose"), icon: <RiMicroscopeLine /> },
    { to: "/app/crops", label: t("navigation.cropAI"), icon: <RiSparklingLine /> },
    { to: "/app/watering", label: t("navigation.watering"), icon: <RiDropLine /> },
    { to: "/app/schedule", label: t("navigation.schedule"), icon: <RiCalendarEventLine /> },
    { to: "/app/community", label: t("navigation.community"), icon: <RiTeamLine /> },
    { to: "/app/profile", label: t("navigation.profile"), icon: <RiUser3Line /> },
  ];

  return (
    <nav className="navbar">
      <div className="navbar-left">
        <Link to="/app" className="logo">Urban Farm</Link>
        <Link to="/" className="nav-landing-link" title={t("navigation.home")}>
          <RiHome4Line />
          <span>{t("navigation.home")}</span>
        </Link>
        {user?.role === "admin" && (
          <Link to="/admin" className="nav-admin-link" title={t("navigation.adminPanel")}>
            <RiShieldUserLine />
            <span>{t("navigation.adminPanel")}</span>
          </Link>
        )}
      </div>

      {/* Desktop right */}
      <div className="navbar-right">
        {user && (
          <>
            <span className="user-name">{getLocalizedDynamicText(user.name, i18n.language)}</span>
            <button className="logout-btn" onClick={logout}>
              <RiLogoutBoxRLine />
              {t("navigation.logout")}
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
                <span className="mobile-nav-user">{getLocalizedDynamicText(user.name, i18n.language)}</span>
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
                  <span>{t("navigation.backToHome")}</span>
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
                    <span>{t("navigation.adminPanel")}</span>
                  </Link>
                )}
              </div>

              <div className="mobile-nav-footer">
                <div className="mobile-lang-wrapper">
                  <LanguageSelector />
                </div>
                <button
                  className="mobile-nav-logout"
                  onClick={() => {
                    logout();
                    setMenuOpen(false);
                  }}
                >
                  <RiLogoutBoxRLine /> {t("navigation.logout")}
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



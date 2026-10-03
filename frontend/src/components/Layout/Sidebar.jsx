import React from "react";
import { NavLink } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
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
import { useAuth } from "../../hooks/useAuth";
import LanguageSelector from "../Common/LanguageSelector";
import "./Sidebar.css";

const Sidebar = () => {
  const { t } = useTranslation();
  const { user } = useAuth();

  if (user?.role === "admin") return null;

  const links = [
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
    <aside className="sidebar">
      <ul>
        {links.map((link) => (
          <li key={link.to}>
            <NavLink
              to={link.to}
              className={({ isActive }) => (isActive ? "active" : "")}
            >
              <span className="icon">{link.icon}</span>
              <span className="label">{link.label}</span>
            </NavLink>
          </li>
        ))}
      </ul>
      <div className="sidebar-language-wrapper">
        <LanguageSelector />
      </div>
    </aside>
  );
};

export default Sidebar;

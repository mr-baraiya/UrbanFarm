import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { RiHome4Line, RiShieldUserLine, RiLogoutBoxRLine } from "react-icons/ri";
import "./Navbar.css";

const Navbar = () => {
  const { user, logout } = useAuth();

  return (
    <nav className="navbar">
      <div className="navbar-left">
        <Link to="/app" className="logo">
          Urban Farm
        </Link>
        <Link to="/" className="nav-landing-link" title="Back to Home / Landing Page">
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
      <div className="navbar-right">
        {user && (
          <>
            <span className="user-name">{user.name}</span>
            <button className="logout-btn" onClick={logout}>
              <RiLogoutBoxRLine style={{ marginRight: "4px" }} />
              Sign out
            </button>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;

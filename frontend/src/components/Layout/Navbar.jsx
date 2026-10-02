import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import "./Navbar.css";

const Navbar = () => {
  const { user, logout } = useAuth();

  return (
    <nav className="navbar">
      <div className="navbar-left">
        <Link to="/app" className="logo">
          Urban Farm
        </Link>
      </div>
      <div className="navbar-right">
        {user && (
          <>
            <span className="user-name">{user.name}</span>
            <button className="logout-btn" onClick={logout}>
              Sign out
            </button>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;

import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import "./Home.css";

const Home = () => {
  const { user } = useAuth();
  return (
    <div className="home-page">
      <div className="hero">
        <h1>Grow more from the space you have.</h1>
        <p>
          Plan beds, understand plant health, and keep a city garden moving with
          less guesswork.
        </p>
        {user ? (
          <Link to="/app" className="btn-primary">
            Open dashboard
          </Link>
        ) : (
          <div className="auth-buttons">
            <Link to="/login" className="btn-primary">
              Sign in
            </Link>
            <Link to="/register" className="btn-secondary">
              Create account
            </Link>
          </div>
        )}
      </div>
      <div className="features">
        <div className="feature">Plant records</div>
        <div className="feature">Health checks</div>
        <div className="feature">Crop planning</div>
        <div className="feature">Watering rhythm</div>
      </div>
    </div>
  );
};

export default Home;

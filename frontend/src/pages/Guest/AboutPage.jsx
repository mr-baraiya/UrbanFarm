import React from 'react';
import { Link } from 'react-router-dom';
import {
  FaLeaf,
  FaBullseye,
  FaGlobe,
  FaUsers,
  FaHandHoldingHeart,
  FaSeedling,
  FaRecycle,
  FaArrowRight,
  FaLinkedin,
  FaGithub,
} from 'react-icons/fa';
import './AboutPage.css';

const AboutPage = () => {
  const teamMembers = [
    {
      name: 'Dr. Alistair Vance',
      role: 'Lead Agronomist & Co-Founder',
      bio: '15+ years in precision agriculture and urban hydroponics. Ph.D. in Crop Physiology.',
      iconBg: '#27ae60',
      initials: 'AV',
    },
    {
      name: 'Sophia Sterling',
      role: 'Chief Technology Officer',
      bio: 'Former AI Vision research scientist specializing in mobile plant pathogen detection.',
      iconBg: '#2980b9',
      initials: 'SS',
    },
    {
      name: 'Devon Reyes',
      role: 'Head of Product & Sustainability',
      bio: 'Passionate rooftop farmer and circular ecology advocate. Built 30+ community gardens.',
      iconBg: '#8e44ad',
      initials: 'DR',
    },
    {
      name: 'Aria Thorne',
      role: 'Community Growth Lead',
      bio: 'Connecting city growers globally. Facilitates seed swaps and urban farming workshops.',
      iconBg: '#d35400',
      initials: 'AT',
    },
  ];

  const sustainabilityPillars = [
    {
      icon: <FaRecycle />,
      title: 'Zero Food Miles',
      desc: 'By producing food directly on urban rooftops and balconies, we eliminate transport emissions and packaging waste.',
    },
    {
      icon: <FaSeedling />,
      title: 'Biodiversity Enhancement',
      desc: 'Urban gardens act as crucial pollinator corridors for bees, butterflies, and native urban wildlife.',
    },
    {
      icon: <FaHandHoldingHeart />,
      title: 'Organic Care Protocols',
      desc: 'Our AI diagnostics exclusively recommend natural biological pest controls and organic soil treatments.',
    },
  ];

  return (
    <div className="about-page">
      {/* Header Banner */}
      <section className="about-hero">
        <div className="about-container text-center">
          <span className="section-tag">OUR MISSION & VISION</span>
          <h1>Cultivating Greener, Resilient Cities One Bed at a Time</h1>
          <p className="about-hero-subtitle">
            UrbanFarm was born out of a simple realization: city spaces hold vast untapped potential to produce fresh, nutrient-dense organic food right where people live.
          </p>
        </div>
      </section>

      {/* Story & Mission Section */}
      <section className="about-story-section">
        <div className="about-container story-grid">
          <div className="story-card">
            <div className="story-icon">
              <FaBullseye />
            </div>
            <h2>Our Mission</h2>
            <p>
              To democratize sustainable food production by equipping urban dwellers with accessible, AI-powered tools, weather intelligence, and community knowledge needed to cultivate high-yield micro-farms.
            </p>
          </div>
          <div className="story-card">
            <div className="story-icon">
              <FaGlobe />
            </div>
            <h2>The Project Story</h2>
            <p>
              Started in 2024 as an open-source initiative by agronomists and developers, UrbanFarm grew into a global movement. Today, our algorithms monitor over 85,000 plants across 45 countries, saving millions of liters of water annually.
            </p>
          </div>
        </div>
      </section>

      {/* Sustainability Focus */}
      <section className="about-sustainability-section">
        <div className="about-container">
          <div className="section-header text-center">
            <span className="section-tag">ECOLOGICAL COMMITMENT</span>
            <h2>Sustainability at the Core</h2>
            <p>We build technologies that honor ecological balance and conserve urban natural resources.</p>
          </div>

          <div className="pillars-grid">
            {sustainabilityPillars.map((p, idx) => (
              <div key={idx} className="pillar-card">
                <div className="pillar-icon">{p.icon}</div>
                <h3>{p.title}</h3>
                <p>{p.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team Introduction */}
      <section className="about-team-section">
        <div className="about-container">
          <div className="section-header text-center">
            <span className="section-tag">MEET THE TEAM</span>
            <h2>Driven by Passion for Agriculture & Tech</h2>
          </div>

          <div className="team-grid">
            {teamMembers.map((m, idx) => (
              <div key={idx} className="team-card">
                <div className="team-avatar" style={{ background: m.iconBg }}>
                  {m.initials}
                </div>
                <h3>{m.name}</h3>
                <span className="team-role">{m.role}</span>
                <p>{m.bio}</p>
                <div className="team-socials">
                  <a href="#linkedin" aria-label="LinkedIn"><FaLinkedin /></a>
                  <a href="#github" aria-label="GitHub"><FaGithub /></a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Impact Stats */}
      <section className="about-impact-banner">
        <div className="about-container text-center">
          <h2>Ready to be part of the urban farming revolution?</h2>
          <p>Join our growing network of balcony growers, rooftop farmers, and community gardens.</p>
          <div className="about-cta-group">
            <Link to="/register" className="landing-btn landing-btn-primary">
              Join UrbanFarm Today <FaArrowRight />
            </Link>
            <Link to="/contact" className="landing-btn landing-btn-secondary">
              Get in Touch
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AboutPage;

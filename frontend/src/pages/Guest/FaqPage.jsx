import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  FaQuestionCircle,
  FaSearch,
  FaChevronDown,
  FaChevronUp,
  FaFilter,
  FaEnvelope,
  FaArrowRight,
} from 'react-icons/fa';
import './FaqPage.css';

const FaqPage = () => {
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [openIndex, setOpenIndex] = useState(0); // Open first by default

  const faqCategories = ['All', 'General', 'AI Diagnosis', 'Irrigation & Weather', 'Account & Privacy'];

  const faqItems = [
    {
      category: 'General',
      question: 'What is UrbanFarm and who is it for?',
      answer: 'UrbanFarm is an intelligent micro-farming management platform tailored for city dwellers growing food on balconies, rooftops, raised beds, or small yard plots. It includes AI disease diagnostics, smart irrigation schedules, and community knowledge sharing.',
    },
    {
      category: 'General',
      question: 'Do I need expensive sensors or hardware to use UrbanFarm?',
      answer: 'No! UrbanFarm works entirely in your browser or mobile phone without extra hardware. Weather irrigation syncs with open meteorological weather APIs, and disease diagnostic uses your smartphone camera.',
    },
    {
      category: 'AI Diagnosis',
      question: 'How accurate is the AI leaf disease scanner?',
      answer: 'Our computer vision classifier achieves over 98.4% diagnostic accuracy across 30+ urban crop species. It can identify early signs of fungal leaf spot, powdery mildew, spider mites, nitrogen deficiency, and bacterial wilt.',
    },
    {
      category: 'AI Diagnosis',
      question: 'What happens if the AI fails to identify my plant illness?',
      answer: 'If confidence is low, you can post your leaf image directly to the UrbanFarm Community Knowledge Hub, where verified agronomists and peer growers will help diagnose the issue.',
    },
    {
      category: 'Irrigation & Weather',
      question: 'How does the weather-based irrigation system work?',
      answer: 'UrbanFarm connects to your local city weather data. If rain is forecasted in your area within 12-24 hours, the app automatically delays scheduled watering sessions for outdoor beds, saving water and preventing root rot.',
    },
    {
      category: 'Irrigation & Weather',
      question: 'Can I use smart irrigation for indoor plants?',
      answer: 'Yes! You can mark individual garden beds or container pots as "Indoor / Covered". The weather-delay feature will be automatically disabled for those specific containers.',
    },
    {
      category: 'Account & Privacy',
      question: 'Is UrbanFarm free to use?',
      answer: 'Yes, UrbanFarm offers a free-forever tier that includes garden space mapping, AI disease scanning, smart weather sync, and community access. Optional premium features are available for large-scale urban farming co-ops.',
    },
    {
      category: 'Account & Privacy',
      question: 'Is my personal garden location kept private?',
      answer: 'Absolutely. Your precise address is never displayed to other users in the community. Only approximate city or neighborhood regions are shown for local seed exchange features.',
    },
  ];

  const filteredFaqs = faqItems.filter((item) => {
    const matchesCategory = categoryFilter === 'All' || item.category === categoryFilter;
    const matchesSearch =
      item.question.toLowerCase().includes(search.toLowerCase()) ||
      item.answer.toLowerCase().includes(search.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const toggleAccordion = (idx) => {
    setOpenIndex(openIndex === idx ? null : idx);
  };

  return (
    <div className="faq-page">
      {/* Hero */}
      <section className="faq-hero">
        <div className="faq-container text-center">
          <span className="section-tag">HELP & SUPPORT</span>
          <h1>Frequently Asked Questions</h1>
          <p className="faq-hero-subtitle">
            Find quick answers to common questions about UrbanFarm tools, AI leaf scanning, smart irrigation, and account settings.
          </p>

          {/* Search Box */}
          <div className="faq-search-wrapper">
            <FaSearch className="faq-search-icon" />
            <input
              type="text"
              placeholder="Search for questions, keywords (e.g. 'watering', 'diagnosis', 'privacy')..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
      </section>

      {/* Main Accordion & Filters Section */}
      <section className="faq-content-section">
        <div className="faq-container">
          {/* Category Tabs */}
          <div className="faq-category-tabs">
            {faqCategories.map((cat) => (
              <button
                key={cat}
                className={`faq-cat-btn ${categoryFilter === cat ? 'active' : ''}`}
                onClick={() => setCategoryFilter(cat)}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Accordion List */}
          <div className="faq-accordion-list">
            {filteredFaqs.length === 0 ? (
              <div className="faq-empty-state">
                <FaQuestionCircle style={{ fontSize: '2.5rem', color: 'var(--text-secondary)', marginBottom: '0.8rem' }} />
                <h3>No matching questions found</h3>
                <p>Try adjusting your search terms or selecting another category.</p>
              </div>
            ) : (
              filteredFaqs.map((faq, idx) => (
                <div
                  key={idx}
                  className={`faq-item ${openIndex === idx ? 'open' : ''}`}
                >
                  <button
                    className="faq-question-btn"
                    onClick={() => toggleAccordion(idx)}
                    aria-expanded={openIndex === idx}
                  >
                    <span className="question-text">
                      <span className="cat-badge">{faq.category}</span>
                      {faq.question}
                    </span>
                    <span className="chevron-icon">
                      {openIndex === idx ? <FaChevronUp /> : <FaChevronDown />}
                    </span>
                  </button>

                  {openIndex === idx && (
                    <div className="faq-answer-content">
                      <p>{faq.answer}</p>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </section>

      {/* Still Have Questions Banner */}
      <section className="faq-cta-banner">
        <div className="faq-container text-center">
          <FaEnvelope style={{ fontSize: '2.2rem', color: 'var(--sage)', marginBottom: '0.8rem' }} />
          <h2>Still Have Questions?</h2>
          <p>Can't find what you're looking for? Contact our friendly agronomy support team.</p>
          <div style={{ marginTop: '1.5rem' }}>
            <Link to="/contact" className="landing-btn landing-btn-primary">
              Contact Support <FaArrowRight />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default FaqPage;

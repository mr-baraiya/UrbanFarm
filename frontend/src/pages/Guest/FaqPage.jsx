import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  FaQuestionCircle,
  FaSearch,
  FaChevronDown,
  FaChevronUp,
  FaEnvelope,
  FaArrowRight,
} from 'react-icons/fa';
import './FaqPage.css';

const FaqPage = () => {
  const { t } = useTranslation();
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [openIndex, setOpenIndex] = useState(0);

  const faqCategories = [
    { id: 'All', label: t('faq.catAll') },
    { id: 'General', label: t('faq.catGeneral') },
    { id: 'AI Diagnosis', label: t('faq.catAI') },
    { id: 'Irrigation & Weather', label: t('faq.catIrrigation') },
    { id: 'Account & Privacy', label: t('faq.catAccount') },
  ];

  const faqItems = [
    {
      categoryId: 'General',
      category: t('faq.catGeneral'),
      question: t('faq.q1Q'),
      answer: t('faq.q1A'),
    },
    {
      categoryId: 'General',
      category: t('faq.catGeneral'),
      question: t('faq.q2Q'),
      answer: t('faq.q2A'),
    },
    {
      categoryId: 'AI Diagnosis',
      category: t('faq.catAI'),
      question: t('faq.q3Q'),
      answer: t('faq.q3A'),
    },
    {
      categoryId: 'AI Diagnosis',
      category: t('faq.catAI'),
      question: t('faq.q4Q'),
      answer: t('faq.q4A'),
    },
    {
      categoryId: 'Irrigation & Weather',
      category: t('faq.catIrrigation'),
      question: t('faq.q5Q'),
      answer: t('faq.q5A'),
    },
    {
      categoryId: 'Irrigation & Weather',
      category: t('faq.catIrrigation'),
      question: t('faq.q6Q'),
      answer: t('faq.q6A'),
    },
    {
      categoryId: 'Account & Privacy',
      category: t('faq.catAccount'),
      question: t('faq.q7Q'),
      answer: t('faq.q7A'),
    },
    {
      categoryId: 'Account & Privacy',
      category: t('faq.catAccount'),
      question: t('faq.q8Q'),
      answer: t('faq.q8A'),
    },
  ];

  const filteredFaqs = faqItems.filter((item) => {
    const matchesCategory = categoryFilter === 'All' || item.categoryId === categoryFilter;
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
          <span className="section-tag">{t('faq.tagHero')}</span>
          <h1>{t('faq.title')}</h1>
          <p className="faq-hero-subtitle">
            {t('faq.subtitle')}
          </p>

          {/* Search Box */}
          <div className="faq-search-wrapper">
            <FaSearch className="faq-search-icon" />
            <input
              type="text"
              placeholder={t('faq.searchPlaceholder')}
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
                key={cat.id}
                className={`faq-cat-btn ${categoryFilter === cat.id ? 'active' : ''}`}
                onClick={() => setCategoryFilter(cat.id)}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Accordion List */}
          <div className="faq-accordion-list">
            {filteredFaqs.length === 0 ? (
              <div className="faq-empty-state">
                <FaQuestionCircle style={{ fontSize: '2.5rem', color: 'var(--text-secondary)', marginBottom: '0.8rem' }} />
                <h3>{t('faq.emptyStateTitle')}</h3>
                <p>{t('faq.emptyStateDesc')}</p>
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
          <h2>{t('faq.ctaTitle')}</h2>
          <p>{t('faq.ctaDesc')}</p>
          <div style={{ marginTop: '1.5rem' }}>
            <Link to="/contact" className="landing-btn landing-btn-primary">
              {t('faq.contactSupportBtn')} <FaArrowRight />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default FaqPage;

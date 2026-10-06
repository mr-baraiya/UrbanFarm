import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import api from '../../services/api';
import { useNotification } from '../../hooks/useNotification';
import ConfirmModal from '../Common/ConfirmModal';
import { validateLeadForm } from '../../utils/validators';
import {
  FaAddressBook,
  FaSearch,
  FaTrash,
  FaFilter,
  FaEnvelope,
  FaPhone,
  FaPlus,
  FaEye,
  FaTimes,
  FaExclamationCircle,
  FaFileCsv,
  FaSync,
  FaChevronDown,
  FaCheck,
} from 'react-icons/fa';
import AdminPagination from './AdminPagination';
import './AdminGuestLeads.css';

const LeadStatusFilterDropdown = ({ value, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const options = [
    { value: 'all', label: 'All Statuses' },
    { value: 'new', label: 'New Inquiry' },
    { value: 'contacted', label: 'Contacted' },
    { value: 'resolved', label: 'Resolved' },
    { value: 'archived', label: 'Archived' },
  ];

  const currentLabel = options.find((o) => o.value === value)?.label || 'All Statuses';

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="custom-admin-dropdown" ref={dropdownRef}>
      <button
        type="button"
        className="custom-dropdown-btn"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span>{currentLabel}</span>
        <FaChevronDown style={{ fontSize: '0.65rem', marginLeft: '0.4rem', opacity: 0.7 }} />
      </button>

      {isOpen && (
        <div className="custom-dropdown-menu">
          {options.map((opt) => (
            <button
              key={opt.value}
              type="button"
              className={`custom-dropdown-item ${value === opt.value ? 'active' : ''}`}
              onClick={() => {
                onChange(opt.value);
                setIsOpen(false);
              }}
            >
              {opt.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

const LeadStatusTableDropdown = ({ leadId, currentStatus, onStatusChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const options = [
    { value: 'new', label: 'New Inquiry' },
    { value: 'contacted', label: 'Contacted' },
    { value: 'resolved', label: 'Resolved' },
    { value: 'archived', label: 'Archived' },
  ];

  const currentLabel = options.find((o) => o.value === currentStatus)?.label || currentStatus;

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="custom-admin-dropdown" ref={dropdownRef}>
      <button
        type="button"
        className={`lead-status-select ${currentStatus}`}
        onClick={() => setIsOpen(!isOpen)}
      >
        <span>{currentLabel}</span>
        <FaChevronDown style={{ fontSize: '0.65rem', marginLeft: '0.35rem', opacity: 0.8 }} />
      </button>

      {isOpen && (
        <div className="custom-dropdown-menu">
          {options.map((opt) => (
            <button
              key={opt.value}
              type="button"
              className={`custom-dropdown-item ${opt.value} ${currentStatus === opt.value ? 'active' : ''}`}
              onClick={() => {
                if (currentStatus !== opt.value) onStatusChange(leadId, opt.value);
                setIsOpen(false);
              }}
            >
              {opt.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

const AdminGuestLeads = () => {
  const { t, i18n } = useTranslation();
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedLead, setSelectedLead] = useState(null);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [exporting, setExporting] = useState(false);

  // Create Lead Modal
  const [showCreateLeadModal, setShowCreateLeadModal] = useState(false);
  const [newLead, setNewLead] = useState({
    name: '',
    email: '',
    phone: '',
    subject: 'General Inquiry',
    message: '',
    status: 'new',
  });
  const [leadErrors, setLeadErrors] = useState({});

  const { addNotification } = useNotification();

  const getSubjectLabel = (subject) => {
    switch (subject) {
      case 'General Inquiry':
        return t('admin.leads.subjects.generalInquiry', 'General Inquiry');
      case 'AI Diagnosis Support':
        return t('admin.leads.subjects.aiDiagnosisSupport', 'AI Diagnosis Support');
      case 'Weather Irrigation Query':
        return t('admin.leads.subjects.weatherIrrigationQuery', 'Weather Irrigation Query');
      case 'Partnership & Enterprise':
        return t('admin.leads.subjects.partnershipEnterprise', 'Partnership & Enterprise');
      case 'Report an Issue':
        return t('admin.leads.subjects.reportIssue', 'Report an Issue');
      default:
        return subject;
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'new':
        return t('admin.leads.statuses.new', 'New');
      case 'contacted':
        return t('admin.leads.statuses.contacted', 'Contacted');
      case 'resolved':
        return t('admin.leads.statuses.resolved', 'Resolved');
      case 'archived':
        return t('admin.leads.statuses.archived', 'Archived');
      default:
        return status;
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    return date.toLocaleString(
      i18n.language === 'gu' ? 'gu-IN' : i18n.language === 'hi' ? 'hi-IN' : 'en-US'
    );
  };

  useEffect(() => {
    loadLeads();
  }, [statusFilter]);

  // Reset page when filter or search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [search, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(leads.length / pageSize));
  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [totalPages, currentPage]);

  const paginatedLeads = useMemo(() => {
    const startIdx = (currentPage - 1) * pageSize;
    return leads.slice(startIdx, startIdx + pageSize);
  }, [leads, currentPage, pageSize]);

  const loadLeads = async (overrideSearch) => {
    setLoading(true);
    try {
      const activeSearch = overrideSearch !== undefined ? overrideSearch : search;
      const params = new URLSearchParams();
      if (activeSearch && activeSearch.trim()) params.append('search', activeSearch.trim());
      if (statusFilter !== 'all') params.append('status', statusFilter);
      params.append('_t', Date.now()); // Prevent stale browser caching

      const res = await api.get(`/admin/leads?${params.toString()}`);
      setLeads(res.data.leads || []);
    } catch (error) {
      console.error('Failed to load guest contact leads:', error);
      addNotification(t('admin.leads.notifications.loadFailed', 'Failed to load guest leads'), 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSearchChange = (e) => {
    const val = e.target.value;
    setSearch(val);
    if (!val.trim()) {
      loadLeads('');
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    loadLeads(search);
  };

  const validateLead = () => {
    const { isValid, errors: formErrors } = validateLeadForm(newLead);
    setLeadErrors(formErrors);
    return isValid;
  };

  const handleCreateLead = async (e) => {
    e.preventDefault();
    if (!validateLead()) return;
    try {
      await api.post('/admin/leads', newLead);
      addNotification(t('admin.leads.notifications.createSuccess', 'New guest inquiry added successfully!'), 'success');
      setShowCreateLeadModal(false);
      setNewLead({
        name: '',
        email: '',
        phone: '',
        subject: 'General Inquiry',
        message: '',
        status: 'new',
      });
      setLeadErrors({});
      loadLeads();
    } catch (error) {
      addNotification(error.response?.data?.message || t('admin.leads.notifications.createFailed', 'Failed to create lead'), 'error');
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    const previousLeads = [...leads];
    const previousSelected = selectedLead;

    setLeads((prevLeads) =>
      prevLeads.map((lead) =>
        lead._id === id ? { ...lead, status: newStatus } : lead
      )
    );
    if (selectedLead && selectedLead._id === id) {
      setSelectedLead((prev) => ({ ...prev, status: newStatus }));
    }

    try {
      const res = await api.put(`/admin/leads/${id}`, { status: newStatus });
      if (res.data?.lead) {
        const serverLead = res.data.lead;
        setLeads((prevLeads) =>
          prevLeads.map((lead) =>
            lead._id === id ? { ...lead, ...serverLead } : lead
          )
        );
        if (selectedLead && selectedLead._id === id) {
          setSelectedLead((prev) => ({ ...prev, ...serverLead }));
        }
      }

      addNotification(
        t('admin.leads.notifications.statusUpdated', 'Lead status updated to {{status}}', {
          status: getStatusLabel(newStatus),
        }),
        'success'
      );
    } catch (error) {
      setLeads(previousLeads);
      if (previousSelected && previousSelected._id === id) {
        setSelectedLead(previousSelected);
      }
      addNotification(t('admin.leads.notifications.statusUpdateFailed', 'Failed to update lead status'), 'error');
    }
  };

  // Confirm Modal state
  const [confirmConfig, setConfirmConfig] = useState({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
  });

  const promptDeleteLead = (id, name) => {
    setConfirmConfig({
      isOpen: true,
      title: t('admin.leads.deleteConfirm.title', 'Delete Guest Inquiry'),
      message: t('admin.leads.deleteConfirm.message', 'Are you sure you want to permanently delete lead from "{{name}}"?', { name }),
      onConfirm: async () => {
        const previousLeads = [...leads];
        setLeads((prev) => prev.filter((lead) => lead._id !== id));
        if (selectedLead && selectedLead._id === id) setSelectedLead(null);

        try {
          await api.delete(`/admin/leads/${id}`);
          addNotification(t('admin.leads.notifications.deleteSuccess', 'Lead deleted successfully'), 'success');
        } catch (error) {
          setLeads(previousLeads);
          addNotification(t('admin.leads.notifications.deleteFailed', 'Failed to delete lead'), 'error');
        }
      },
    });
  };

  const handleExportCSV = async () => {
    setExporting(true);
    try {
      const response = await api.get('/admin/export/leads', {
        responseType: 'blob',
        params: { _t: Date.now() },
      });
      const blob = new Blob([response.data], { type: 'text/csv;charset=utf-8;' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'urbanfarm_guest_leads_export.csv');
      document.body.appendChild(link);
      link.click();
      setTimeout(() => {
        if (link.parentNode) {
          link.parentNode.removeChild(link);
        }
        window.URL.revokeObjectURL(url);
      }, 400);
      addNotification(t('admin.leads.exportSuccess', 'Guest leads CSV exported successfully!'), 'success');
    } catch (error) {
      console.error('Failed to export leads CSV:', error);
      addNotification(t('admin.leads.exportFailed', 'Failed to export leads CSV'), 'error');
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="guest-leads-container">
      <ConfirmModal
        isOpen={confirmConfig.isOpen}
        title={confirmConfig.title}
        message={confirmConfig.message}
        onConfirm={confirmConfig.onConfirm}
        onClose={() => setConfirmConfig({ ...confirmConfig, isOpen: false })}
      />
      <div className="admin-page-header">
        <div>
          <h2>{t('admin.leads.title', 'Guest Inquiries & Contact Leads')}</h2>
          <p>{t('admin.leads.subtitle', 'Review messages submitted through the public Contact Us form, log new leads manually, track status, and connect with urban farmers.')}</p>
        </div>
        <div className="admin-header-actions">
          <button
            className="admin-btn admin-btn-outline"
            onClick={handleExportCSV}
            disabled={exporting || leads.length === 0}
            title={t('admin.leads.exportCSV', 'Export CSV')}
          >
            {exporting ? (
              <>
                <FaSync className="fa-spin" /> {t('admin.exportingCSV', 'Exporting...')}
              </>
            ) : (
              <>
                <FaFileCsv /> {t('admin.leads.exportCSV', 'Export CSV')}
              </>
            )}
          </button>
          <button className="admin-btn admin-btn-primary" onClick={() => setShowCreateLeadModal(true)}>
            <FaPlus /> {t('admin.leads.addNewInquiry', 'Add New Inquiry')}
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="admin-filter-bar">
        <form onSubmit={handleSearchSubmit} className="admin-search-box">
          <FaSearch className="search-icon" />
          <input
            type="text"
            placeholder={t('admin.leads.searchPlaceholder', 'Search leads by name, email, subject or content...')}
            value={search}
            onChange={handleSearchChange}
            autoComplete="off"
          />
          <button type="submit" className="admin-btn admin-btn-sm search-submit-btn">{t('common.search', 'Search')}</button>
        </form>
        <div className="admin-filters">
          <div className="filter-group">
            <FaFilter />
            <label>{t('admin.leads.statusFilter', 'Status:')}</label>
            <LeadStatusFilterDropdown value={statusFilter} onChange={(val) => setStatusFilter(val)} />
          </div>
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div className="admin-loading-spinner">{t('admin.leads.loading', 'Loading guest inquiries...')}</div>
      ) : (
        <div className="admin-table-wrapper">
          <table className="admin-data-table">
            <thead>
              <tr>
                <th>{t('admin.leads.thSender', 'Sender')}</th>
                <th>{t('admin.leads.thContact', 'Contact')}</th>
                <th>{t('admin.leads.thSubject', 'Subject')}</th>
                <th>{t('admin.leads.thStatus', 'Status')}</th>
                <th>{t('admin.leads.thDateReceived', 'Date Received')}</th>
                <th>{t('admin.leads.thActions', 'Actions')}</th>
              </tr>
            </thead>
            <tbody>
              {leads.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center py-4">{t('admin.leads.noLeads', 'No contact inquiries found.')}</td>
                </tr>
              ) : (
                paginatedLeads.map((lead) => (
                  <tr key={lead._id} className={`lead-row-${lead.status}`}>
                    <td data-label={t('admin.leads.thSender', 'Sender')}>
                      <div className="td-cell-content">
                        <strong>{lead.name}</strong>
                      </div>
                    </td>
                    <td data-label={t('admin.leads.thContact', 'Contact')}>
                      <div className="td-cell-content">
                        <small><FaEnvelope /> {lead.email}</small>
                        {lead.phone && <small style={{ marginTop: '0.15rem' }}><FaPhone /> {lead.phone}</small>}
                      </div>
                    </td>
                    <td data-label={t('admin.leads.thSubject', 'Subject')}>
                      <div className="td-cell-content">
                        <span className="lead-subject-tag">{getSubjectLabel(lead.subject)}</span>
                      </div>
                    </td>
                    <td data-label={t('admin.leads.thStatus', 'Status')}>
                      <div className="td-cell-content">
                        <LeadStatusTableDropdown
                          leadId={lead._id}
                          currentStatus={lead.status}
                          onStatusChange={handleStatusChange}
                        />
                      </div>
                    </td>
                    <td data-label={t('admin.leads.thDateReceived', 'Date Received')}>
                      <div className="td-cell-content">
                        <small>{formatDate(lead.createdAt)}</small>
                      </div>
                    </td>
                    <td data-label={t('admin.leads.thActions', 'Actions')}>
                      <div className="action-btns">
                        <button
                          className="admin-action-icon approve"
                          title={t('admin.leads.viewMessage', 'View Message')}
                          onClick={() => setSelectedLead(lead)}
                        >
                          <FaEye />
                        </button>
                        <button
                          className="admin-action-icon delete"
                          title={t('admin.leads.deleteLead', 'Delete Lead')}
                          onClick={() => promptDeleteLead(lead._id, lead.name)}
                        >
                          <FaTrash />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>

          <AdminPagination
            currentPage={currentPage}
            totalItems={leads.length}
            pageSize={pageSize}
            onPageChange={setCurrentPage}
            onPageSizeChange={setPageSize}
          />
        </div>
      )}

      {/* Create New Lead Modal */}
      {showCreateLeadModal && (
        <div className="admin-modal-overlay" onClick={() => setShowCreateLeadModal(false)}>
          <div className="admin-modal" style={{ maxHeight: '88vh', display: 'flex', flexDirection: 'column' }} onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">
              <h3><FaPlus /> {t('admin.leads.createModal.title', 'Add New Guest Inquiry')}</h3>
              <button className="modal-close" onClick={() => setShowCreateLeadModal(false)}>
                <FaTimes />
              </button>
            </div>
            <form onSubmit={handleCreateLead} className="admin-modal-form" style={{ overflowY: 'auto' }} noValidate>
              <div className="form-group">
                <label>{t('admin.leads.createModal.fullName', 'Sender Full Name')} <span className="required">*</span></label>
                <input
                  type="text"
                  placeholder={t('admin.leads.createModal.fullNamePlaceholder', 'e.g. Alex Morgan')}
                  value={newLead.name}
                  onChange={(e) => setNewLead({ ...newLead, name: e.target.value })}
                  className={leadErrors.name ? 'input-error' : ''}
                />
                {leadErrors.name && <span className="error-text"><FaExclamationCircle /> {leadErrors.name}</span>}
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>{t('admin.leads.createModal.email', 'Email Address')} <span className="required">*</span></label>
                  <input
                    type="email"
                    placeholder={t('admin.leads.createModal.emailPlaceholder', 'e.g. alex@example.com')}
                    value={newLead.email}
                    onChange={(e) => setNewLead({ ...newLead, email: e.target.value })}
                    className={leadErrors.email ? 'input-error' : ''}
                  />
                  {leadErrors.email && <span className="error-text"><FaExclamationCircle /> {leadErrors.email}</span>}
                </div>

                <div className="form-group">
                  <label>{t('admin.leads.createModal.phone', 'Phone Number (Optional)')}</label>
                  <input
                    type="tel"
                    placeholder={t('admin.leads.createModal.phonePlaceholder', 'e.g. +91 9876543210')}
                    value={newLead.phone}
                    onChange={(e) => setNewLead({ ...newLead, phone: e.target.value })}
                    className={leadErrors.phone ? 'input-error' : ''}
                  />
                  {leadErrors.phone && <span className="error-text"><FaExclamationCircle /> {leadErrors.phone}</span>}
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>{t('admin.leads.createModal.subject', 'Subject / Topic')} <span className="required">*</span></label>
                  <select
                    value={newLead.subject}
                    onChange={(e) => setNewLead({ ...newLead, subject: e.target.value })}
                  >
                    <option value="General Inquiry">{t('admin.leads.subjects.generalInquiry', 'General Inquiry')}</option>
                    <option value="AI Diagnosis Support">{t('admin.leads.subjects.aiDiagnosisSupport', 'AI Diagnosis Support')}</option>
                    <option value="Weather Irrigation Query">{t('admin.leads.subjects.weatherIrrigationQuery', 'Weather Irrigation Query')}</option>
                    <option value="Partnership & Enterprise">{t('admin.leads.subjects.partnershipEnterprise', 'Partnership & Enterprise')}</option>
                    <option value="Report an Issue">{t('admin.leads.subjects.reportIssue', 'Report an Issue')}</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>{t('admin.leads.createModal.initialStatus', 'Initial Status')}</label>
                  <select
                    value={newLead.status}
                    onChange={(e) => setNewLead({ ...newLead, status: e.target.value })}
                  >
                    <option value="new">{t('admin.leads.statuses.newInquiry', 'New Inquiry')}</option>
                    <option value="contacted">{t('admin.leads.statuses.contacted', 'Contacted')}</option>
                    <option value="resolved">{t('admin.leads.statuses.resolved', 'Resolved')}</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label>{t('admin.leads.createModal.message', 'Inquiry Message Content')} <span className="required">*</span></label>
                <textarea
                  style={{
                    padding: '0.65rem',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--border)',
                    background: 'var(--surface)',
                    color: 'var(--text)',
                    minHeight: '80px',
                    fontFamily: 'inherit'
                  }}
                  placeholder={t('admin.leads.createModal.messagePlaceholder', 'Enter message text submitted by guest...')}
                  value={newLead.message}
                  onChange={(e) => setNewLead({ ...newLead, message: e.target.value })}
                  className={leadErrors.message ? 'input-error' : ''}
                />
                {leadErrors.message && <span className="error-text"><FaExclamationCircle /> {leadErrors.message}</span>}
              </div>

              <div className="admin-modal-footer">
                <button type="button" className="admin-btn admin-btn-outline" onClick={() => setShowCreateLeadModal(false)}>
                  {t('admin.leads.createModal.cancel', 'Cancel')}
                </button>
                <button type="submit" className="admin-btn admin-btn-primary">
                  <FaCheck /> {t('admin.leads.createModal.submit', 'Add Inquiry')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Lead Detail Modal */}
      {selectedLead && (
        <div className="admin-modal-overlay" onClick={() => setSelectedLead(null)}>
          <div className="admin-modal" style={{ maxWidth: '600px', maxHeight: '88vh', display: 'flex', flexDirection: 'column' }} onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">
              <h3><FaAddressBook /> {t('admin.leads.detailModal.title', 'Guest Inquiry Message')}</h3>
              <button className="modal-close" onClick={() => setSelectedLead(null)}>
                <FaTimes />
              </button>
            </div>
            <div className="admin-modal-form" style={{ overflowY: 'auto' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <h4 style={{ margin: 0, fontSize: '1.2rem', color: 'var(--text)' }}>{selectedLead.name}</h4>
                  <div style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
                    <FaEnvelope /> {selectedLead.email}
                    {selectedLead.phone && <span style={{ marginLeft: '1rem' }}><FaPhone /> {selectedLead.phone}</span>}
                  </div>
                </div>
                <span className={`lead-status-select ${selectedLead.status}`} style={{ padding: '0.3rem 0.8rem', borderRadius: '20px', fontSize: '0.8rem', fontWeight: '600' }}>
                  {getStatusLabel(selectedLead.status).toUpperCase()}
                </span>
              </div>

              <div style={{ padding: '0.8rem', background: 'var(--surface)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)' }}>
                <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block' }}>{t('admin.leads.detailModal.subjectLabel', 'SUBJECT')}</label>
                <strong style={{ fontSize: '0.95rem', color: 'var(--primary)' }}>{getSubjectLabel(selectedLead.subject)}</strong>
              </div>

              <div style={{
                padding: '1rem',
                background: 'var(--surface)',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border)',
                fontSize: '0.92rem',
                lineHeight: '1.6',
                whiteSpace: 'pre-wrap'
              }}>
                {selectedLead.message}
              </div>

              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                {t('admin.leads.detailModal.receivedOn', 'Received on:')} {formatDate(selectedLead.createdAt)}
              </div>

              <div className="admin-modal-footer">
                {selectedLead.status === 'new' && (
                  <button
                    type="button"
                    className="admin-btn admin-btn-primary"
                    onClick={() => handleStatusChange(selectedLead._id, 'contacted')}
                  >
                    <FaCheck /> {t('admin.leads.detailModal.markContacted', 'Mark as Contacted')}
                  </button>
                )}
                {selectedLead.status === 'contacted' && (
                  <button
                    type="button"
                    className="admin-btn admin-btn-primary"
                    onClick={() => handleStatusChange(selectedLead._id, 'resolved')}
                  >
                    <FaCheck /> {t('admin.leads.detailModal.markResolved', 'Mark as Resolved')}
                  </button>
                )}
                <button type="button" className="admin-btn admin-btn-outline" onClick={() => setSelectedLead(null)}>
                  {t('admin.leads.detailModal.close', 'Close')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminGuestLeads;

import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { useNotification } from '../../hooks/useNotification';
import ConfirmModal from '../Common/ConfirmModal';
import { validateLeadForm } from '../../utils/validators';
import {
  FaAddressBook,
  FaSearch,
  FaTrash,
  FaCheck,
  FaFilter,
  FaEnvelope,
  FaPhone,
  FaPlus,
  FaEye,
  FaTimes,
  FaExclamationCircle,
} from 'react-icons/fa';
import './AdminGuestLeads.css';

const AdminGuestLeads = () => {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedLead, setSelectedLead] = useState(null);

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

  useEffect(() => {
    loadLeads();
  }, [statusFilter]);

  const loadLeads = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (statusFilter !== 'all') params.append('status', statusFilter);

      const res = await api.get(`/admin/leads?${params.toString()}`);
      setLeads(res.data.leads || []);
    } catch (error) {
      console.error('Failed to load guest contact leads:', error);
      addNotification('Failed to load guest leads', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    loadLeads();
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
      addNotification('New guest inquiry added successfully!', 'success');
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
      addNotification(error.response?.data?.message || 'Failed to create lead', 'error');
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      await api.put(`/admin/leads/${id}`, { status: newStatus });
      addNotification(`Lead status updated to ${newStatus}`, 'success');
      loadLeads();
      if (selectedLead && selectedLead._id === id) {
        setSelectedLead((prev) => ({ ...prev, status: newStatus }));
      }
    } catch (error) {
      addNotification('Failed to update lead status', 'error');
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
      title: 'Delete Guest Inquiry',
      message: `Are you sure you want to permanently delete lead from "${name}"?`,
      onConfirm: async () => {
        try {
          await api.delete(`/admin/leads/${id}`);
          addNotification('Lead deleted successfully', 'success');
          if (selectedLead && selectedLead._id === id) setSelectedLead(null);
          loadLeads();
        } catch (error) {
          addNotification('Failed to delete lead', 'error');
        }
      },
    });
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
          <h2>Guest Inquiries & Contact Leads</h2>
          <p>Review messages submitted through the public Contact Us form, log new leads manually, track status, and connect with urban farmers.</p>
        </div>
        <div className="admin-header-actions">
          <button className="admin-btn admin-btn-primary" onClick={() => setShowCreateLeadModal(true)}>
            <FaPlus /> Add New Inquiry
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="admin-filter-bar">
        <form onSubmit={handleSearchSubmit} className="admin-search-box">
          <FaSearch className="search-icon" />
          <input
            type="text"
            placeholder="Search leads by name, email, subject or content..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <button type="submit" className="admin-btn admin-btn-sm">Search</button>
        </form>
        <div className="admin-filters">
          <div className="filter-group">
            <FaFilter />
            <label>Status:</label>
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              <option value="all">All Statuses</option>
              <option value="new">New</option>
              <option value="contacted">Contacted</option>
              <option value="resolved">Resolved</option>
              <option value="archived">Archived</option>
            </select>
          </div>
          <button className="admin-btn admin-btn-sm" onClick={loadLeads}>Apply</button>
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div className="admin-loading-spinner">Loading guest inquiries...</div>
      ) : (
        <div className="admin-table-wrapper">
          <table className="admin-data-table">
            <thead>
              <tr>
                <th>Sender</th>
                <th>Contact</th>
                <th>Subject</th>
                <th>Status</th>
                <th>Date Received</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {leads.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center py-4">No contact inquiries found.</td>
                </tr>
              ) : (
                leads.map((lead) => (
                  <tr key={lead._id} className={`lead-row-${lead.status}`}>
                    <td>
                      <strong>{lead.name}</strong>
                    </td>
                    <td>
                      <small><FaEnvelope /> {lead.email}</small>
                      {lead.phone && <><br /><small><FaPhone /> {lead.phone}</small></>}
                    </td>
                    <td>
                      <span className="lead-subject-tag">{lead.subject}</span>
                    </td>
                    <td>
                      <select
                        value={lead.status}
                        onChange={(e) => handleStatusChange(lead._id, e.target.value)}
                        className={`lead-status-select ${lead.status}`}
                      >
                        <option value="new">New Inquiry</option>
                        <option value="contacted">Contacted</option>
                        <option value="resolved">Resolved</option>
                        <option value="archived">Archived</option>
                      </select>
                    </td>
                    <td><small>{new Date(lead.createdAt).toLocaleString()}</small></td>
                    <td>
                      <div className="action-btns">
                        <button
                          className="admin-action-icon approve"
                          title="View Message"
                          onClick={() => setSelectedLead(lead)}
                        >
                          <FaEye />
                        </button>
                        <button
                          className="admin-action-icon delete"
                          title="Delete Lead"
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
        </div>
      )}

      {/* Create New Lead Modal */}
      {showCreateLeadModal && (
        <div className="admin-modal-overlay" onClick={() => setShowCreateLeadModal(false)}>
          <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">
              <h3><FaPlus /> Add New Guest Inquiry</h3>
              <button className="modal-close" onClick={() => setShowCreateLeadModal(false)}>
                <FaTimes />
              </button>
            </div>
            <form onSubmit={handleCreateLead} className="admin-modal-form" noValidate>
              <div className="form-group">
                <label>Sender Full Name <span className="required">*</span></label>
                <input
                  type="text"
                  placeholder="e.g. Alex Morgan"
                  value={newLead.name}
                  onChange={(e) => setNewLead({ ...newLead, name: e.target.value })}
                  className={leadErrors.name ? 'input-error' : ''}
                />
                {leadErrors.name && <span className="error-text"><FaExclamationCircle /> {leadErrors.name}</span>}
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Email Address <span className="required">*</span></label>
                  <input
                    type="email"
                    placeholder="e.g. alex@example.com"
                    value={newLead.email}
                    onChange={(e) => setNewLead({ ...newLead, email: e.target.value })}
                    className={leadErrors.email ? 'input-error' : ''}
                  />
                  {leadErrors.email && <span className="error-text"><FaExclamationCircle /> {leadErrors.email}</span>}
                </div>

                <div className="form-group">
                  <label>Phone Number (Optional)</label>
                  <input
                    type="tel"
                    placeholder="e.g. +1 (555) 000-1234"
                    value={newLead.phone}
                    onChange={(e) => setNewLead({ ...newLead, phone: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Subject / Topic <span className="required">*</span></label>
                  <select
                    value={newLead.subject}
                    onChange={(e) => setNewLead({ ...newLead, subject: e.target.value })}
                  >
                    <option value="General Inquiry">General Inquiry</option>
                    <option value="AI Diagnosis Support">AI Diagnosis Support</option>
                    <option value="Weather Irrigation Query">Weather Irrigation Query</option>
                    <option value="Partnership & Enterprise">Partnership & Enterprise</option>
                    <option value="Report an Issue">Report an Issue</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Initial Status</label>
                  <select
                    value={newLead.status}
                    onChange={(e) => setNewLead({ ...newLead, status: e.target.value })}
                  >
                    <option value="new">New Inquiry</option>
                    <option value="contacted">Contacted</option>
                    <option value="resolved">Resolved</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label>Inquiry Message Content <span className="required">*</span></label>
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
                  placeholder="Enter message text submitted by guest..."
                  value={newLead.message}
                  onChange={(e) => setNewLead({ ...newLead, message: e.target.value })}
                  className={leadErrors.message ? 'input-error' : ''}
                />
                {leadErrors.message && <span className="error-text"><FaExclamationCircle /> {leadErrors.message}</span>}
              </div>

              <div className="admin-modal-footer">
                <button type="button" className="admin-btn admin-btn-outline" onClick={() => setShowCreateLeadModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="admin-btn admin-btn-primary">
                  <FaCheck /> Add Inquiry
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Lead Detail Modal */}
      {selectedLead && (
        <div className="admin-modal-overlay" onClick={() => setSelectedLead(null)}>
          <div className="admin-modal" style={{ maxWidth: '600px' }} onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">
              <h3><FaAddressBook /> Guest Inquiry Message</h3>
              <button className="modal-close" onClick={() => setSelectedLead(null)}>
                <FaTimes />
              </button>
            </div>
            <div className="admin-modal-form">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <h4 style={{ margin: 0, fontSize: '1.2rem', color: 'var(--text)' }}>{selectedLead.name}</h4>
                  <div style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
                    <FaEnvelope /> {selectedLead.email}
                    {selectedLead.phone && <span style={{ marginLeft: '1rem' }}><FaPhone /> {selectedLead.phone}</span>}
                  </div>
                </div>
                <span className={`lead-status-select ${selectedLead.status}`} style={{ padding: '0.3rem 0.8rem', borderRadius: '20px', fontSize: '0.8rem', fontWeight: '600' }}>
                  {selectedLead.status.toUpperCase()}
                </span>
              </div>

              <div style={{ padding: '0.8rem', background: 'var(--surface)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)' }}>
                <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block' }}>SUBJECT</label>
                <strong style={{ fontSize: '0.95rem', color: 'var(--primary)' }}>{selectedLead.subject}</strong>
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
                Received on: {new Date(selectedLead.createdAt).toLocaleString()}
              </div>

              <div className="admin-modal-footer">
                {selectedLead.status === 'new' && (
                  <button
                    type="button"
                    className="admin-btn admin-btn-primary"
                    onClick={() => handleStatusChange(selectedLead._id, 'contacted')}
                  >
                    <FaCheck /> Mark as Contacted
                  </button>
                )}
                {selectedLead.status === 'contacted' && (
                  <button
                    type="button"
                    className="admin-btn admin-btn-primary"
                    onClick={() => handleStatusChange(selectedLead._id, 'resolved')}
                  >
                    <FaCheck /> Mark as Resolved
                  </button>
                )}
                <button type="button" className="admin-btn admin-btn-outline" onClick={() => setSelectedLead(null)}>
                  Close
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

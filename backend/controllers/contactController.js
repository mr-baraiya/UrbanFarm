const ContactLead = require('../models/ContactLead');
const AdminLog = require('../models/AdminLog');

// @desc    Submit guest contact form
// @route   POST /api/contact
// @access  Public
exports.submitContactForm = async (req, res, next) => {
  try {
    const { name, email, phone, subject, message } = req.body;

    if (!name || !email || !subject || !message) {
      return res.status(400).json({
        success: false,
        message: 'Please fill in all required fields (name, email, subject, message)',
      });
    }

    // Basic email validation
    const emailRegex = /^\S+@\S+\.\S+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid email address',
      });
    }

    const lead = await ContactLead.create({
      name,
      email,
      phone: phone || '',
      subject,
      message,
    });

    res.status(201).json({
      success: true,
      message: 'Thank you for reaching out! Our team will contact you shortly.',
      lead: {
        id: lead._id,
        name: lead.name,
        email: lead.email,
        createdAt: lead.createdAt,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all guest contact leads (admin)
// @route   GET /api/admin/leads
// @access  Private/Admin
exports.getContactLeads = async (req, res, next) => {
  try {
    const { search, status } = req.query;
    let query = {};

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { subject: { $regex: search, $options: 'i' } },
        { message: { $regex: search, $options: 'i' } },
      ];
    }

    if (status && status !== 'all') {
      query.status = status;
    }

    const leads = await ContactLead.find(query).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: leads.length,
      leads,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update lead status / notes (admin)
// @route   PUT /api/admin/leads/:id
// @access  Private/Admin
exports.updateContactLead = async (req, res, next) => {
  try {
    const { status, notes } = req.body;
    const updateData = {};
    if (status) updateData.status = status;
    if (notes !== undefined) updateData.notes = notes;

    const lead = await ContactLead.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true,
    });

    if (!lead) {
      return res.status(404).json({ success: false, message: 'Lead record not found' });
    }

    try {
      await AdminLog.create({
        adminId: req.user.id,
        action: 'update_contact_lead',
        targetType: 'contact_lead',
        targetId: lead._id,
        details: updateData,
      });
    } catch (logErr) {
      console.error('AdminLog creation warning (update_contact_lead):', logErr.message);
    }

    res.status(200).json({ success: true, lead });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete contact lead (admin)
// @route   DELETE /api/admin/leads/:id
// @access  Private/Admin
exports.deleteContactLead = async (req, res, next) => {
  try {
    const lead = await ContactLead.findByIdAndDelete(req.params.id);
    if (!lead) {
      return res.status(404).json({ success: false, message: 'Lead record not found' });
    }

    try {
      await AdminLog.create({
        adminId: req.user.id,
        action: 'delete_contact_lead',
        targetType: 'contact_lead',
        targetId: req.params.id,
        details: { email: lead.email, subject: lead.subject },
      });
    } catch (logErr) {
      console.error('AdminLog creation warning (delete_contact_lead):', logErr.message);
    }

    res.status(200).json({ success: true, message: 'Contact lead deleted' });
  } catch (error) {
    next(error);
  }
};

// @desc    Create lead manually (admin)
// @route   POST /api/admin/leads
// @access  Private/Admin
exports.createContactLead = async (req, res, next) => {
  try {
    const { name, email, phone, subject, message, status } = req.body;
    if (!name || !email || !subject || !message) {
      return res.status(400).json({ success: false, message: 'Please fill in all required fields' });
    }
    const lead = await ContactLead.create({
      name,
      email,
      phone: phone || '',
      subject,
      message,
      status: status || 'new',
    });
    try {
      await AdminLog.create({
        adminId: req.user.id,
        action: 'create_contact_lead',
        targetType: 'contact_lead',
        targetId: lead._id,
        details: { name: lead.name, email: lead.email, subject: lead.subject },
      });
    } catch (logErr) {
      console.error('AdminLog creation warning (create_contact_lead):', logErr.message);
    }

    res.status(201).json({ success: true, lead });
  } catch (error) {
    next(error);
  }
};

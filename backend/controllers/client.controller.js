const Client = require('../models/Client');
const Project = require('../models/Project');
const Counter = require('../models/Counter');
const PaymentPlan = require('../models/PaymentPlan');
const PaymentPhase = require('../models/PaymentPhase');
const PaymentHistory = require('../models/PaymentHistory');
const Roadmap = require('../models/Roadmap');
const ProjectComment = require('../models/ProjectComment');
const generatePassword = require('../utils/generatePassword');

const createClient = async (req, res) => {
  try {
    const { name, email, password, phone, company, gst, address } = req.body;

    if (!name || !email) {
      return res.status(400).json({ success: false, message: 'Name and email are required.' });
    }

    // Basic phone validation (if provided)
    if (phone && (typeof phone !== 'string' || phone.length > 20)) {
      return res.status(400).json({ success: false, message: 'Phone number must be a string with max 20 characters.' });
    }

    const existingClient = await Client.findOne({ email });
    if (existingClient) {
      return res.status(400).json({ success: false, message: 'Client with this email already exists.' });
    }

    // Use provided password or generate one
    const clientPassword = password || generatePassword();

    // Generate clientCode
    const seq = await Counter.getNextSequence('client');
    const clientCode = `CLT-${String(seq).padStart(4, '0')}`;

    const client = await Client.create({
      clientCode,
      name,
      email,
      password: clientPassword,
      phone: phone || '',
      company: company || '',
      gst: gst || '',
      address: address || ''
    });

    // Return client without password (include generated password once for admin to copy)
    const clientResponse = {
      _id: client._id,
      clientCode: client.clientCode,
      name: client.name,
      email: client.email,
      phone: client.phone,
      company: client.company,
      gst: client.gst,
      address: client.address,
      status: client.status,
      createdAt: client.createdAt,
      updatedAt: client.updatedAt,
      generatedPassword: !password ? clientPassword : undefined
    };

    res.status(201).json({ success: true, message: 'Client created.', data: clientResponse });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error.', error: error.message });
  }
};

const updateClient = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, phone, company, gst, address } = req.body;

    // Basic phone validation (if provided)
    if (phone !== undefined && phone !== null && (typeof phone !== 'string' || phone.length > 20)) {
      return res.status(400).json({ success: false, message: 'Phone number must be a string with max 20 characters.' });
    }

    const updateData = { name, email };
    if (phone !== undefined) updateData.phone = phone;
    if (company !== undefined) updateData.company = company;
    if (gst !== undefined) updateData.gst = gst;
    if (address !== undefined) updateData.address = address;
    if (phone !== undefined) {
      updateData.phone = phone;
    }

    const client = await Client.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!client) {
      return res.status(404).json({ success: false, message: 'Client not found.' });
    }

    res.json({ success: true, message: 'Client updated.', data: client });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error.', error: error.message });
  }
};

const deleteClient = async (req, res) => {
  try {
    const { id } = req.params;

    const client = await Client.findById(id);
    if (!client) {
      return res.status(404).json({ success: false, message: 'Client not found.' });
    }

    // Cascade: remove client from assigned projects
    await Project.updateMany(
      { assignedClients: id },
      { $pull: { assignedClients: id } }
    );

    // Cascade: delete related payment data
    const paymentPlans = await PaymentPlan.find({ client: id });
    const planIds = paymentPlans.map(p => p._id);

    if (planIds.length > 0) {
      await PaymentPhase.deleteMany({ paymentPlan: { $in: planIds } });
      await PaymentHistory.deleteMany({ client: id });
      await PaymentPlan.deleteMany({ client: id });
    }

    // Cascade: delete client's comments
    await ProjectComment.deleteMany({ sender: id, senderModel: 'Client' });

    await Client.findByIdAndDelete(id);

    res.json({ success: true, message: 'Client and related data deleted.' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error.', error: error.message });
  }
};

const updateClientStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['Active', 'Paused', 'Completed'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status. Use Active, Paused, or Completed.' });
    }

    const client = await Client.findByIdAndUpdate(
      id,
      { status },
      { new: true, runValidators: true }
    );

    if (!client) {
      return res.status(404).json({ success: false, message: 'Client not found.' });
    }

    res.json({ success: true, message: 'Client status updated.', data: client });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error.', error: error.message });
  }
};

// Get clients with pagination, search, and filters
const getClients = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const { search, status, company } = req.query;

    // Build query conditions
    const query = {};

    // Search across name, email, phone, clientCode
    if (search && search.trim()) {
      const searchRegex = new RegExp(search.trim(), 'i');
      query.$or = [
        { name: searchRegex },
        { email: searchRegex },
        { phone: searchRegex },
        { clientCode: searchRegex }
      ];
    }

    // Filter by status
    if (status && ['Active', 'Paused', 'Completed'].includes(status)) {
      query.status = status;
    }

    // Filter by company (partial match)
    if (company && company.trim()) {
      query.company = new RegExp(company.trim(), 'i');
    }

    const [clients, total] = await Promise.all([
      Client.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Client.countDocuments(query)
    ]);

    // Fetch projects for these clients
    const clientIds = clients.map(client => client._id);
    const projects = await Project.find({
      assignedClients: { $in: clientIds }
    })
      .select('title status assignedClients')
      .lean();

    // Map projects to clients
    const clientsWithProjects = clients.map(client => {
      const clientProjects = projects.filter(project =>
        project.assignedClients.some(id => id.toString() === client._id.toString())
      );
      return {
        ...client,
        projects: clientProjects
      };
    });

    const totalPages = Math.ceil(total / limit);

    res.json({
      success: true,
      data: clientsWithProjects,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasMore: page < totalPages
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error.', error: error.message });
  }
};

// Get client details with projects
const getClientProjects = async (req, res) => {
  try {
    const { id } = req.params;

    const client = await Client.findById(id).lean();
    if (!client) {
      return res.status(404).json({ success: false, message: 'Client not found.' });
    }

    const projects = await Project.find({
      assignedClients: id
    }).sort({ createdAt: -1 }).lean();

    res.json({
      success: true,
      data: {
        client,
        projects
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error.', error: error.message });
  }
};

// Get all clients without pagination (for dropdowns)
const getAllClients = async (req, res) => {
  try {
    const clients = await Client.find().sort({ name: 1 }).lean();
    res.json({ success: true, data: clients });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error.', error: error.message });
  }
};

module.exports = { createClient, updateClient, deleteClient, updateClientStatus, getClients, getAllClients, getClientProjects };

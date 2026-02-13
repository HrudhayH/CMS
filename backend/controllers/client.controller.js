const Client = require('../models/Client');
const Project = require('../models/Project');

const createClient = async (req, res) => {
  try {
    const { name, email, password, phone, company, gst, address } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Name, email, and password are required.' });
    }

    // Basic phone validation (if provided)
    if (phone && (typeof phone !== 'string' || phone.length > 20)) {
      return res.status(400).json({ success: false, message: 'Phone number must be a string with max 20 characters.' });
    }

    const existingClient = await Client.findOne({ email });
    if (existingClient) {
      return res.status(400).json({ success: false, message: 'Client with this email already exists.' });
    }

    const client = await Client.create({
      name,
      email,
      password,
      phone: phone || '',
      company: company || '',
      gst: gst || '',
      address: address || ''
    });

    // Return client without password
    const clientResponse = {
      _id: client._id,
      name: client.name,
      email: client.email,
      phone: client.phone,
      status: client.status,
      createdAt: client.createdAt,
      updatedAt: client.updatedAt
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

    const client = await Client.findByIdAndDelete(id);
    if (!client) {
      return res.status(404).json({ success: false, message: 'Client not found.' });
    }

    res.json({ success: true, message: 'Client deleted.' });
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
    const { search, status } = req.query;

    // Build query conditions
    const query = {};

    // Search across name, email, phone
    if (search && search.trim()) {
      const searchRegex = new RegExp(search.trim(), 'i');
      query.$or = [
        { name: searchRegex },
        { email: searchRegex },
        { phone: searchRegex }
      ];
    }

    // Filter by status
    if (status && ['Active', 'Paused', 'Completed'].includes(status)) {
      query.status = status;
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

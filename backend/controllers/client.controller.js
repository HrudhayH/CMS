const Client = require('../models/Client');

const createClient = async (req, res) => {
  try {
    const { name, email } = req.body;

    if (!name || !email) {
      return res.status(400).json({ success: false, message: 'Name and email are required.' });
    }

    const existingClient = await Client.findOne({ email });
    if (existingClient) {
      return res.status(400).json({ success: false, message: 'Client with this email already exists.' });
    }

    const client = await Client.create({ name, email });
    res.status(201).json({ success: true, message: 'Client created.', data: client });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error.', error: error.message });
  }
};

const updateClient = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email } = req.body;

    const client = await Client.findByIdAndUpdate(
      id,
      { name, email },
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

const getAllClients = async (req, res) => {
  try {
    const clients = await Client.find();
    res.json({ success: true, data: clients });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error.', error: error.message });
  }
};

module.exports = { createClient, updateClient, deleteClient, updateClientStatus, getAllClients };

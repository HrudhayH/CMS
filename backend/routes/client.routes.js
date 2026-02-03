const express = require('express');
const router = express.Router();
const {
  createClient,
  updateClient,
  deleteClient,
  updateClientStatus,
  getClients,
  getAllClients
} = require('../controllers/client.controller');

router.get('/', getClients);
router.get('/all', getAllClients);
router.post('/', createClient);
router.put('/:id', updateClient);
router.delete('/:id', deleteClient);
router.patch('/:id/status', updateClientStatus);

module.exports = router;

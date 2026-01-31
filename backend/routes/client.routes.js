const express = require('express');
const router = express.Router();
const {
  createClient,
  updateClient,
  deleteClient,
  updateClientStatus,
  getAllClients
} = require('../controllers/client.controller');

router.get('/', getAllClients);
router.post('/', createClient);
router.put('/:id', updateClient);
router.delete('/:id', deleteClient);
router.patch('/:id/status', updateClientStatus);

module.exports = router;

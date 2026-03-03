const express = require('express');
const router = express.Router();
const {
  createPaymentPlan,
  getPaymentPlans,
  getPaymentPlan,
  getPaymentsByClient,
  getPaymentByProject,
  markPhaseAsPaid,
  markFullPayment,
  getPaymentHistory,
  addPhases,
  updatePaymentPlan,
  updatePhase,
  deletePhase
} = require('../controllers/payment.controller');

// Payment plans
router.get('/', getPaymentPlans);
router.post('/', createPaymentPlan);
router.get('/history', getPaymentHistory);
router.get('/client/:clientId', getPaymentsByClient);
router.get('/project/:projectId', getPaymentByProject);
router.get('/:id', getPaymentPlan);
router.patch('/:id', updatePaymentPlan);
router.post('/:id/phases', addPhases);
router.patch('/:id/phases/:phaseId', updatePhase);
router.delete('/:id/phases/:phaseId', deletePhase);
router.patch('/:id/phases/:phaseId/pay', markPhaseAsPaid);
router.patch('/:id/pay', markFullPayment);

module.exports = router;

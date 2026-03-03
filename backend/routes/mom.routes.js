const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/authMiddleware');
const roleMiddleware = require('../middlewares/roleMiddleware');
const {
    createMOM,
    getAllMOMs,
    getMOMById,
    getMOMsByProject,
    updateMOM,
    deleteMOM
} = require('../controllers/mom.controller');

// Apply auth middleware to all routes
router.use(authMiddleware);

// POST /api/mom/create (Staff and Admin)
router.post('/create', roleMiddleware(['staff', 'admin', 'super_admin']), createMOM);

// GET /api/mom/all (All roles, but filtered in controller)
router.get('/all', roleMiddleware(['staff', 'admin', 'super_admin', 'client']), getAllMOMs);

// GET /api/mom/:id
router.get('/:id', roleMiddleware(['staff', 'admin', 'super_admin', 'client']), getMOMById);

// GET /api/mom/project/:projectId
router.get('/project/:projectId', roleMiddleware(['staff', 'admin', 'super_admin', 'client']), getMOMsByProject);

// PUT /api/mom/update/:id
router.put('/update/:id', roleMiddleware(['staff', 'super_admin']), updateMOM);

// DELETE /api/mom/delete/:id
router.delete('/delete/:id', roleMiddleware(['staff', 'super_admin']), deleteMOM);

module.exports = router;

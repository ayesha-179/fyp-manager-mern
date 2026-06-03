const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
  getStats,
  getUsers,
  createUser,
  updateUser,
  deleteUser,
  getProjects,
  deleteProject
} = require('../controllers/adminController');

router.use(protect, authorize('admin'));

router.get('/stats', getStats);
router.get('/users', getUsers);
router.post('/users', createUser);
router.put('/users/:id', updateUser);
router.delete('/users/:id', deleteUser);
router.get('/projects', getProjects);
router.delete('/projects/:id', deleteProject);

module.exports = router;

const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
  getStats,
  getMyProjects,
  getSupervisors,
  submitProject,
  updateProject,
  markComplete,
  getEvaluations,
  addComment
} = require('../controllers/studentController');

router.use(protect, authorize('student'));

router.get('/stats', getStats);
router.get('/myprojects', getMyProjects);
router.get('/supervisors', getSupervisors);
router.post('/submit-project', submitProject);
router.put('/update-project/:id', updateProject);
router.put('/complete/:id', markComplete);
router.get('/evaluations', getEvaluations);
router.post('/comment/:id', addComment);

module.exports = router;

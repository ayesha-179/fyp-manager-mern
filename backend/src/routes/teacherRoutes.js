const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
  getStats,
  getPendingRequests,
  getApprovedGroups,
  getCompletedProjects,
  acceptProject,
  rejectProject,
  addComment,
  saveEvaluation,
  getEvaluations
} = require('../controllers/teacherController');

router.use(protect, authorize('teacher'));

router.get('/stats', getStats);
router.get('/pending', getPendingRequests);
router.get('/approved', getApprovedGroups);
router.get('/completed', getCompletedProjects);
router.put('/accept/:id', acceptProject);
router.put('/reject/:id', rejectProject);
router.post('/comment/:id', addComment);
router.post('/evaluate/:id', saveEvaluation);
router.get('/evaluations/:id', getEvaluations);

module.exports = router;
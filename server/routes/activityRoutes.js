const express = require('express');
const router = express.Router();
const { getActivityLogs } = require('../controllers/activityController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/roles');

router.use(protect);
router.use(authorize('ADMIN'));

router.get('/', getActivityLogs);

module.exports = router;

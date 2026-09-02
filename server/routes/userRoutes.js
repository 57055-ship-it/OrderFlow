const express = require('express');
const router = express.Router();
const { getUsers, createUser, updateUser, toggleUserStatus, deleteUser } = require('../controllers/userController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/roles');

router.use(protect);
router.use(authorize('ADMIN'));

router.route('/').get(getUsers).post(createUser);
router.route('/:id').put(updateUser).delete(deleteUser);
router.patch('/:id/status', toggleUserStatus);

module.exports = router;

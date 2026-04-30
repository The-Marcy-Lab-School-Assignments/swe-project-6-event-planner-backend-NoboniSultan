const userModel = require('../models/userModel');

const updateUser = async (req, res) => {
    const { user_id } = req.params;
    const { password } = req.body;

    if (!password) return res.status(400).json({ message: 'Password is required' });
    if (Number(user_id) !== req.session.userId) {
        return res.status(403).json({ message: 'Forbidden.' });
    }

    try {
        const user = await userModel.updatePassword(user_id, password);
        if (!user) return res.status(404).json({ message: 'User not found.' });
        res.json(user);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error.' });
    }
};

const deleteUser = async (req, res) => {
    const { user_id } = req.params;

    if (Number(user_id) !== req.session.userId) {
        return res.status(403).json({ message: 'Forbidden.' });
    }
    try {
        const user = await userModel.remove(user_id);
        if (!user) return res.status(404).json({ message: 'User not found.' });
        req.session = null;
        res.json(user);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error.' });
    }
};

module.exports = { updateUser, deleteUser };
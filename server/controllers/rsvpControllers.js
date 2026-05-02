const rsvpModel = require('../models/rsvpModel');

const createRsvp = async (req, res) => {
    const { event_id } = req.params;
    try {
        const rsvp = await rsvpModel.create(req.session.userId, event_id);
        res.status(201).json(rsvp || null);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error.' });
    }
};

const deleteRsvp = async (req, res) => {
    const { event_id } = req.params;
    try {
        const rsvp = await rsvpModel.remove(req.session.userId, event_id);
        res.json(rsvp || null);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error.' });
    }
};

const listUserRsvps = async (req, res) => {
    try {
        const events = await rsvpModel.listEventsByUser(req.params.user_id);
        res.json(events);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error.' });
    }
};

module.exports = { createRsvp, deleteRsvp, listUserRsvps };
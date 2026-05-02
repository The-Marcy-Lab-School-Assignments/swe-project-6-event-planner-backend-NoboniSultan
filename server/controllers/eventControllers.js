const eventModel = require('../models/eventModel');

const listEvents = async (req, res) => {
    try {
        const events = await eventModel.list();
        res.json(events);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error.' });
    }
};

const listUserEvents = async (req, res) => {
    try {
        const events = await eventModel.listByUser(req.params.user_id);
        res.json(events);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error.' });
    }
};

const createEvent = async (req, res) => {
    const { title, description, date, location, event_type, max_capacity } = req.body;

    if (!title || !date || !location || !event_type || !max_capacity) {
        return res.status(400).json({ message: 'title, date, location, event_type, and max_capacity are required.' });
    }
    if (!eventModel.VALID_TYPES.includes(event_type)) {
        return res.status(400).json({ message: `event_type must be one of: ${eventModel.VALID_TYPES.join(', ')}` });
    }

    try {
        const event = await eventModel.create(req.body, req.session.userId);
        res.status(201).json(event);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error.' });
    }
};

const updateEvent = async (req, res) => {
    const { event_id } = req.params;

    try {
        const existing = await eventModel.findById(event_id);
        if (!existing) return res.status(404).json({ message: 'Event not found.' });
        if (existing.user_id !== req.session.userId) {
            return res.status(403).json({ message: 'Forbidden' });
        }

        const event = await eventModel.update(event_id, req.body);
        res.json(event);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error.' });
    }
};

const deleteEvent = async (req, res) => {
    const { event_id } = req.params;

    try {
        const existing = await eventModel.findById(event_id);
        if (!existing) return res.status(404).json({ message: 'Event not found.' });
        if (existing.user_id !== req.session.userId) {
            return res.status(403).json({ message: 'Forbidden.' });
        }

        const event = await eventModel.remove(event_id);
        res.json(event);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error.' });
    }
};

module.exports = { listEvents, listUserEvents, createEvent, updateEvent, deleteEvent };
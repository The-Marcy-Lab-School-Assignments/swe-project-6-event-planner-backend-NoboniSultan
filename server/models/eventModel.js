const pool = require('../db/pool');

const VALID_TYPES = ['conference', 'workshop', 'social', 'networking', 'concert', 'sports', 'fundraiser', 'other'];

// All events with username + rsvp_count, sorted by date
const list = async () => {
    const { rows } = await pool.query(`
       SELECT
            events.event_id,
            events.title,
            events.date,
            events.location,
            events.event_type,
            events.max_capacity,
            events.user_id,
            users.username,
            COUNT (rsvps.rsvp_id) AS rsvp_count
        FROM events
        INNER JOIN users ON events.user_id = users.user_id
        LEFT JOIN rsvps ON events.event_id = rsvps.event_id
        GROUP BY events.event_id, users.username
        ORDER BY events.date ASC
    `);
    return rows;
};

const listByUser = async (userId) => {
    const { rows } = await pool.query(`
        SELECT
            events.event_id,
            events.title,
            events.description, 
            events.date,
            events.location,
            events.event_type,
            events.max_capacity,
            events.user_id,
            COUNT (rsvps.rsvp_id) AS rsvp_count
        FROM events
        LEFT JOIN rsvps ON events.event_id = rsvps.event_id
        WHERE events.user_id = $1
        GROUP BY events.event_id
        ORDER BY events.date ASC
        `, [userId]);
    return rows;
};

const findById = async (eventId) => {
    const { rows } = await pool.query(
        `SELECT * FROM events WHERE events.event_id = $1`,
        [eventId]
    );
    return rows[0] || null;
};

const create = async ({ title, description, date, location, evnet_type, max_capacity }, userId) => {
    const { rows } = await pool.query(`
        INSERT INTO events (title, description, date, location, event_type, max_capacity, user_id)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING *
        `, [title, description || null, date, location, evnet_type, max_type, userId]);
    return rows[0];
};

const update = async (eventId, fields) => {
    const allowed = ['title', 'description', 'date', 'location', 'event_type', 'max_capacity'];
    const updates = [];
    const values = [];
    let i = 1;

    for (const key of allowed) {
        if (fields[key] !== undefined) {
            updates.push(` ${key} = ${i++}`);
            values.push(fields[key]);
        }
    }

    values.push(eventId);
    const { rows } = await pool.query(`
            UPDATE events SET ${updates.join(', ')}
            WHERE events.event_id = $${i}
            RETURNING *
        `, values);
    return rows[0] || null;
};

const remove = async (eventId) => {
    const { rows } = await pool.query(
        `DELETE FROM events WHERE events.event_id = $1 RETURNING *`,
        [eventId]
    );
    return rows[0] || null;
};

module.exports = { list, listByUser, findById, create, update, remove, VALID_TYPES };
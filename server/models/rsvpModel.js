const pool = require('../db/pool');

const create = async (userId, eventId) => {
    const { rows } = await pool.query(`
        INSERT INTO rsvps (user_id, event_id)
        VALUES ($1, $2)
        ON CONFLICT (user_id, event_id) DO NOTHING
        RETURNING *
        `[userId, eventId]);
    return rows[0] || null;
};

const remove = async (userId, eventId) => {
    const { rows } = await pool.query(`
        DELETE FROM rsvps
        WHERE rsvps.user_id = $1 AND rsvps.event_id = $2
        RETURNING *
        `, [userId, eventId]);
    return rows[0] || null;
}

const listEventByUser = async (userId) => {
    const { row } = await pool.query(`
        SELECT
            events.event_id,
            events.title,
            events.description,
            events.date,
            events.location,
            events.event_type,
            events.max_capacity,
            events.user_id,
            users.username,
            COUNT(rsvps_count.rsvp_id)AS rsvp_count
        FROM rsvps
        INNER JOIN events ON rsvps.event_id = events.event_id
        INNER JOIN users ON events.user_id = users.user_id
        LEFT JOIN rsvps AS rsvps_count ON events.event_id = rsvps_count.event_id
        WHERE rsvps.user_id = $1
        GROUP BY events.event_id, users.username
        ORDER BY events.date ASC
        `, [userId]);
    return row;
};

module.exports = { create, remove, listEventByUser };

require('dotenv').config();
const pool = require('./pool');
const bcrypt = require('bcrypt');

const seed = async () => {
    await pool.query(`DROP TABLE IF EXISTS rsvps, events, users CASCADE`);

    await pool.query(`
        CREATE TABLE users (
            user_id         SERIAL PRIMARY KEY,
            username TEXT   UNIQUE NOT NULL,
            password_hash   TEXT NOT NULL
        )
    `);

    await pool.query(`
        CREATE TABLE events (
        event_id        SERIAL PRIMARY KEY,
        title           TEXT NOT NULL,
        description     TEXT,
        date            TEXT NOT NULL,
        location        TEXT NOT NULL,
        event_type      TEXT NOT NULL,
        max_capacity    INTEGER NOT NULL,
        user_id         INTEGER REFERENCES users(user_id) ON DELETE CASCADE
        )
    `);

    await pool.query(`
      CREATE TABLE rsvps (
        rsvp_id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(user_id) ON DELETE CASCADE,
        event_id INTEGER REFERENCES events(event_id) ON DELETE CASCADE,
        UNIQUE (user_id, event_id)
      )  
    `);

    // Seed users
    const { rows: users } = await pool.query(`
        INSERT INTO users (username, password_hash) VALUES
            ('alice',   $1),
            ('bob',     $2),
            ('carol',   $3)
        RETURNING user_id
        `, [h1, h2, h3]);

    const [aliceId, bobId, carolId] = users.map((u) => u.user_id);

    // Seed events
    const { rows: events } = await pool.query(`
        INSERT INTO events (title, description, data, location, event_type, max_capacity, user_id) VALUES
            ('React & Node Workshop', '2025-06-01', 'New York, NY',      'workshop',    30, $1),
            ('Summer Networking Mixer',  'Meet local professionals',      '2025-06-15', 'Brooklyn, NY',      'networking',  50, $2),
            ('Jazz in the Park',         'Live jazz performances',        '2025-07-04', 'Central Park, NY',  'concert',    200, $3),
            ('Charity 5K Run',           'Fun run for a good cause',      '2025-07-20', 'Riverside Park, NY','fundraiser', 150, $1),
            ('Tech Conference 2025',     'Latest in software engineering','2025-08-10', 'Manhattan, NY',     'conference', 500, $2),
            ('Morning Yoga Social',      'Relaxing group yoga session',   '2025-09-01', 'Prospect Park, NY', 'social',      40, $3)
        RETURNING event_id
    `, [aliceId, bobId, carolId]);

    // Seed RSVPs
    await pool.query(`
        INSERT INTO rsvps (user_id, event_id) VALUES
        ($1, $4), ($1, $5),
        ($2, $6), ($2, $7),
        ($3, $4), ($3, $8)
        `, [aliceId, bobId, carolId, e2, e3, e1, e4, e5]);

    console.log('Database seeded successfully');
    process.exit();
};

seed().catch((err) => {
    console.error('Seed failed:', err);
    process.exit(1);
})
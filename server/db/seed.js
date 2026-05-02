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
    const h1 = await bcrypt.hash('password1', 10);
    const h2 = await bcrypt.hash('password2', 10);
    const h3 = await bcrypt.hash('password3', 10);

    const { rows: users } = await pool.query(`
        INSERT INTO users (username, password_hash) VALUES
            ('alice',   $1),
            ('bob',     $2),
            ('carol',   $3)
        RETURNING user_id
        `, [h1, h2, h3]);

    const aliceId = users[0].user_id;
    const bobId = users[1].user_id;
    const carolId = users[2].user_id;

    // Seed events
    const { rows: events } = await pool.query(`
        INSERT INTO events (title, description, date, location, event_type, max_capacity, user_id) VALUES
            ('React & Node Workshop',    'Hands-on full-stack session',   '2025-06-01', 'New York, NY',      'workshop',    30, $1),
            ('Summer Networking Mixer',  'Meet local professionals',      '2025-06-15', 'Brooklyn, NY',      'networking',  50, $2),
            ('Jazz in the Park',         'Live jazz performances',        '2025-07-04', 'Central Park, NY',  'concert',    200, $3),
            ('Charity 5K Run',           'Fun run for a good cause',      '2025-07-20', 'Riverside Park, NY','fundraiser', 150, $1),
            ('Tech Conference 2025',     'Latest in software engineering','2025-08-10', 'Manhattan, NY',     'conference', 500, $2),
            ('Morning Yoga Social',      'Relaxing group yoga session',   '2025-09-01', 'Prospect Park, NY', 'social',      40, $3)
        RETURNING event_id
    `, [aliceId, bobId, carolId]);

    const e1 = events[0].event_id;
    const e2 = events[1].event_id;
    const e3 = events[2].event_id;
    const e4 = events[3].event_id;
    const e5 = events[4].event_id;
    const e6 = events[5].event_id;

    // Seed RSVPs
    await pool.query(`
        INSERT INTO rsvps (user_id, event_id) VALUES
            ($1, $4),
            ($1, $5),
            ($2, $6),
            ($2, $3),
            ($3, $1),
            ($3, $4)
        `, [aliceId, bobId, carolId, e2, e3, e6]);

    console.log('Database seeded successfully');
    process.exit();
};

seed().catch((err) => {
    console.error('Seed failed:', err);
    process.exit(1);
})
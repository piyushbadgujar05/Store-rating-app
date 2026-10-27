const bcrypt = require('bcryptjs');
const db = require('../config/db');

async function seedDatabase() {
  if (process.env.NODE_ENV === 'production') {
    console.warn('Database seed script is restricted to development environments.');
    return;
  }

  console.log('Seeding initial database records...');

  try {
    await db.query('DELETE FROM ratings');
    await db.query('DELETE FROM stores');
    await db.query('DELETE FROM users');

    const salt = await bcrypt.genSalt(10);
    const adminPass = await bcrypt.hash('AdminPassword123!', salt);
    const ownerPass = await bcrypt.hash('OwnerPassword123!', salt);
    const userPass = await bcrypt.hash('UserPassword123!', salt);

    const { rows: adminRows } = await db.query(
      `INSERT INTO users (name, email, address, password_hash, role)
       VALUES ($1, $2, $3, $4, $5) RETURNING id, name, email`,
      [
        'Rahul Shrikant Verma',
        'rahul.verma@example.com',
        '72, South Tukoganj, Near Treasure Island, Indore, Madhya Pradesh 452001',
        adminPass,
        'ADMIN',
      ]
    );

    const { rows: ownerRows } = await db.query(
      `INSERT INTO users (name, email, address, password_hash, role)
       VALUES ($1, $2, $3, $4, $5) RETURNING id, name, email`,
      [
        'Rohan Chandrakant Patil',
        'rohan.patil@example.com',
        'Shop 8, College Road, Nashik, Maharashtra 422005',
        ownerPass,
        'STORE_OWNER',
      ]
    );

    const { rows: user1Rows } = await db.query(
      `INSERT INTO users (name, email, address, password_hash, role)
       VALUES ($1, $2, $3, $4, $5) RETURNING id, name, email`,
      [
        'Aarav Rameshwar Sharma',
        'aarav.sharma@example.com',
        'Shop 12, FC Road, Shivajinagar, Pune, Maharashtra 411005',
        userPass,
        'USER',
      ]
    );

    const { rows: user2Rows } = await db.query(
      `INSERT INTO users (name, email, address, password_hash, role)
       VALUES ($1, $2, $3, $4, $5) RETURNING id, name, email`,
      [
        'Priya Sudhakar Deshmukh',
        'priya.deshmukh@example.com',
        'Shop 4, Baner Road, Baner, Pune, Maharashtra 411045',
        userPass,
        'USER',
      ]
    );

    const { rows: user3Rows } = await db.query(
      `INSERT INTO users (name, email, address, password_hash, role)
       VALUES ($1, $2, $3, $4, $5) RETURNING id, name, email`,
      [
        'Ananya Venkat Kulkarni',
        'ananya.kulkarni@example.com',
        'Shop 21, Indiranagar, Bengaluru, Karnataka 560038',
        userPass,
        'USER',
      ]
    );

    const { rows: store1Rows } = await db.query(
      `INSERT INTO stores (name, email, address, owner_id)
       VALUES ($1, $2, $3, $4) RETURNING id, name`,
      [
        'Sahyadri Grocery Mart',
        'contact@sahyadrigrocery.in',
        'Shop 12, FC Road, Shivajinagar, Pune, Maharashtra 411005',
        ownerRows[0].id,
      ]
    );

    const { rows: store2Rows } = await db.query(
      `INSERT INTO stores (name, email, address, owner_id)
       VALUES ($1, $2, $3, $4) RETURNING id, name`,
      [
        'Deccan Daily Needs Supermarket',
        'contact@deccandaily.in',
        'Shop 4, Linking Road, Bandra West, Mumbai, Maharashtra 400050',
        ownerRows[0].id,
      ]
    );

    const { rows: store3Rows } = await db.query(
      `INSERT INTO stores (name, email, address, owner_id)
       VALUES ($1, $2, $3, $4) RETURNING id, name`,
      [
        'Narmada General Stores',
        'contact@narmadastores.in',
        'Shop 18, Chhappan Dukan, New Palasia, Indore, Madhya Pradesh 452001',
        ownerRows[0].id,
      ]
    );

    const { rows: store4Rows } = await db.query(
      `INSERT INTO stores (name, email, address, owner_id)
       VALUES ($1, $2, $3, $4) RETURNING id, name`,
      [
        'Malabar Fresh Produce Mart',
        'contact@malabarfresh.in',
        'Shop 9, Marine Drive Walkway, Ernakulam, Kochi, Kerala 682011',
        ownerRows[0].id,
      ]
    );

    const { rows: store5Rows } = await db.query(
      `INSERT INTO stores (name, email, address, owner_id)
       VALUES ($1, $2, $3, $4) RETURNING id, name`,
      [
        'Bengaluru Corner Market',
        'contact@bengalurumarket.in',
        'Shop 21, 100 Feet Road, HAL 2nd Stage, Indiranagar, Bengaluru, Karnataka 560038',
        null,
      ]
    );

    await db.query('INSERT INTO ratings (user_id, store_id, rating) VALUES ($1, $2, $3)', [
      user1Rows[0].id,
      store1Rows[0].id,
      5,
    ]);
    await db.query('INSERT INTO ratings (user_id, store_id, rating) VALUES ($1, $2, $3)', [
      user2Rows[0].id,
      store1Rows[0].id,
      4,
    ]);
    await db.query('INSERT INTO ratings (user_id, store_id, rating) VALUES ($1, $2, $3)', [
      user3Rows[0].id,
      store1Rows[0].id,
      5,
    ]);

    await db.query('INSERT INTO ratings (user_id, store_id, rating) VALUES ($1, $2, $3)', [
      user1Rows[0].id,
      store2Rows[0].id,
      4,
    ]);
    await db.query('INSERT INTO ratings (user_id, store_id, rating) VALUES ($1, $2, $3)', [
      user2Rows[0].id,
      store2Rows[0].id,
      4,
    ]);

    await db.query('INSERT INTO ratings (user_id, store_id, rating) VALUES ($1, $2, $3)', [
      user2Rows[0].id,
      store3Rows[0].id,
      4,
    ]);

    await db.query('INSERT INTO ratings (user_id, store_id, rating) VALUES ($1, $2, $3)', [
      user1Rows[0].id,
      store4Rows[0].id,
      5,
    ]);

    await db.query('INSERT INTO ratings (user_id, store_id, rating) VALUES ($1, $2, $3)', [
      user3Rows[0].id,
      store5Rows[0].id,
      5,
    ]);

    console.log('Database seeded successfully.');
  } catch (err) {
    console.error('Seeding failed:', err);
    throw err;
  }
}

if (require.main === module) {
  seedDatabase()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}

module.exports = seedDatabase;

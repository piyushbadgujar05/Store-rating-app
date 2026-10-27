const bcrypt = require('bcryptjs');
const db = require('../config/db');

async function seedDatabase() {
  console.log('Running database seed script...');

  try {
    // Reset existing rows so seed is idempotent
    await db.query('DELETE FROM ratings');
    await db.query('DELETE FROM stores');
    await db.query('DELETE FROM users');

    const salt = await bcrypt.genSalt(10);
    const adminPass = await bcrypt.hash('AdminPassword123!', salt);
    const ownerPass = await bcrypt.hash('OwnerPassword123!', salt);
    const userPass = await bcrypt.hash('UserPassword123!', salt);

    // 1. Insert seed users
    const { rows: adminRows } = await db.query(
      `INSERT INTO users (name, email, address, password_hash, role)
       VALUES ($1, $2, $3, $4, $5) RETURNING id, email`,
      [
        'System Administrator Primary', // 28 chars
        'admin@platform.com',
        '100 Enterprise Boulevard, Suite 500, Silicon Valley, CA 94025',
        adminPass,
        'ADMIN',
      ]
    );

    const { rows: owner1Rows } = await db.query(
      `INSERT INTO users (name, email, address, password_hash, role)
       VALUES ($1, $2, $3, $4, $5) RETURNING id, email`,
      [
        'Alexander Jonathan Montgomery', // 29 chars
        'owner@applecentral.com',
        '450 Market Street, Financial District, San Francisco, CA 94105',
        ownerPass,
        'STORE_OWNER',
      ]
    );

    const { rows: owner2Rows } = await db.query(
      `INSERT INTO users (name, email, address, password_hash, role)
       VALUES ($1, $2, $3, $4, $5) RETURNING id, email`,
      [
        'Victoria Beatrice Kensington', // 29 chars
        'owner@organicgrocer.com',
        '880 Broadway Avenue, Manhattan, New York, NY 10003',
        ownerPass,
        'STORE_OWNER',
      ]
    );

    const { rows: user1Rows } = await db.query(
      `INSERT INTO users (name, email, address, password_hash, role)
       VALUES ($1, $2, $3, $4, $5) RETURNING id, email`,
      [
        'Christopher Daniel Lawrence', // 27 chars
        'user1@example.com',
        '742 Evergreen Terrace, Springfield, OR 97477',
        userPass,
        'USER',
      ]
    );

    const { rows: user2Rows } = await db.query(
      `INSERT INTO users (name, email, address, password_hash, role)
       VALUES ($1, $2, $3, $4, $5) RETURNING id, email`,
      [
        'Elizabeth Katherine Davis Jr.', // 28 chars
        'user2@example.com',
        '123 Elm Street, Metropolis, NY 10001',
        userPass,
        'USER',
      ]
    );

    const { rows: user3Rows } = await db.query(
      `INSERT INTO users (name, email, address, password_hash, role)
       VALUES ($1, $2, $3, $4, $5) RETURNING id, email`,
      [
        'Benjamin Harrison Richardson', // 28 chars
        'user3@example.com',
        '555 Pinecrest Lane, Seattle, WA 98101',
        userPass,
        'USER',
      ]
    );

    // 2. Insert stores
    const { rows: store1Rows } = await db.query(
      `INSERT INTO stores (name, email, address, owner_id)
       VALUES ($1, $2, $3, $4) RETURNING id, name`,
      [
        'Apple Central Premium Storefront', // 32 chars
        'contact@applecentral.com',
        '1 Infinite Loop, Cupertino, CA 95014',
        owner1Rows[0].id,
      ]
    );

    const { rows: store2Rows } = await db.query(
      `INSERT INTO stores (name, email, address, owner_id)
       VALUES ($1, $2, $3, $4) RETURNING id, name`,
      [
        'Whole Foods Organic Market Branch', // 33 chars
        'contact@organicgrocer.com',
        '550 Bowie Street, Austin, TX 78703',
        owner2Rows[0].id,
      ]
    );

    const { rows: store3Rows } = await db.query(
      `INSERT INTO stores (name, email, address, owner_id)
       VALUES ($1, $2, $3, $4) RETURNING id, name`,
      [
        'Barnes & Noble Literary Emporium', // 32 chars
        'contact@barnesnobleemporium.com',
        '33 East 17th Street, Union Square, NY 10003',
        owner1Rows[0].id,
      ]
    );

    const { rows: store4Rows } = await db.query(
      `INSERT INTO stores (name, email, address, owner_id)
       VALUES ($1, $2, $3, $4) RETURNING id, name`,
      [
        'Nordstrom Heritage Fashion Depot', // 32 chars
        'contact@nordstromheritage.com',
        '500 Pine Street, Downtown Seattle, WA 98101',
        null,
      ]
    );

    // 3. Insert ratings
    await db.query(
      'INSERT INTO ratings (user_id, store_id, rating) VALUES ($1, $2, $3)',
      [user1Rows[0].id, store1Rows[0].id, 5]
    );

    await db.query(
      'INSERT INTO ratings (user_id, store_id, rating) VALUES ($1, $2, $3)',
      [user2Rows[0].id, store1Rows[0].id, 4]
    );

    await db.query(
      'INSERT INTO ratings (user_id, store_id, rating) VALUES ($1, $2, $3)',
      [user3Rows[0].id, store1Rows[0].id, 5]
    );

    await db.query(
      'INSERT INTO ratings (user_id, store_id, rating) VALUES ($1, $2, $3)',
      [user1Rows[0].id, store2Rows[0].id, 4]
    );

    await db.query(
      'INSERT INTO ratings (user_id, store_id, rating) VALUES ($1, $2, $3)',
      [user2Rows[0].id, store2Rows[0].id, 3]
    );

    await db.query(
      'INSERT INTO ratings (user_id, store_id, rating) VALUES ($1, $2, $3)',
      [user1Rows[0].id, store3Rows[0].id, 5]
    );

    console.log('Seeded users, stores, and ratings successfully.');
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

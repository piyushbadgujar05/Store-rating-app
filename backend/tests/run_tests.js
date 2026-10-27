const http = require('http');

const BASE_URL = 'http://localhost:5000/api';

function request(method, path, body = null, token = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(`${BASE_URL}${path}`);
    const options = {
      method,
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          resolve({ status: res.statusCode, body: parsed });
        } catch {
          resolve({ status: res.statusCode, raw: data });
        }
      });
    });

    req.on('error', reject);
    if (body) {
      req.write(JSON.stringify(body));
    }
    req.end();
  });
}

async function runTestSuite() {
  console.log('Running Final Code Review and Verification Suite...\n');

  let passed = 0;
  let failed = 0;

  function assert(condition, testName, note = '') {
    if (condition) {
      console.log(`  [PASS] ${testName} ${note ? '(' + note + ')' : ''}`);
      passed++;
    } else {
      console.error(`  [FAIL] ${testName} ${note ? '(' + note + ')' : ''}`);
      failed++;
    }
  }

  try {
    const health = await request('GET', '/health');
    assert(health.status === 200 && health.body.status === 'healthy', 'GET /api/health returns 200 and healthy status');

    const shortNameRes = await request('POST', '/auth/register', {
      name: 'Short Name',
      email: 'shortname@example.com',
      address: 'Shop 12, FC Road, Pune 411005',
      password: 'Password123!',
    });
    assert(
      shortNameRes.status === 400 && shortNameRes.body.message.includes('20 and 60 characters'),
      'Validation: Rejects name under 20 characters',
      shortNameRes.body.message
    );

    const longNameRes = await request('POST', '/auth/register', {
      name: 'A'.repeat(61),
      email: 'longname@example.com',
      address: 'Shop 12, FC Road, Pune 411005',
      password: 'Password123!',
    });
    assert(
      longNameRes.status === 400 && longNameRes.body.message.includes('20 and 60 characters'),
      'Validation: Rejects name over 60 characters'
    );

    const weakPassRes = await request('POST', '/auth/register', {
      name: 'Vikas Shrikant Deshmukh',
      email: 'weakpass@example.com',
      address: 'Shop 12, FC Road, Pune 411005',
      password: 'password123!',
    });
    assert(
      weakPassRes.status === 400 && weakPassRes.body.message.includes('uppercase letter'),
      'Validation: Rejects password missing uppercase'
    );

    const noSpecialPassRes = await request('POST', '/auth/register', {
      name: 'Vikas Shrikant Deshmukh',
      email: 'nospecial@example.com',
      address: 'Shop 12, FC Road, Pune 411005',
      password: 'Password1234',
    });
    assert(
      noSpecialPassRes.status === 400 && noSpecialPassRes.body.message.includes('special character'),
      'Validation: Rejects password missing special character'
    );

    const shortPassRes = await request('POST', '/auth/register', {
      name: 'Vikas Shrikant Deshmukh',
      email: 'shortpass@example.com',
      address: 'Shop 12, FC Road, Pune 411005',
      password: 'Pass1!',
    });
    assert(
      shortPassRes.status === 400 && shortPassRes.body.message.includes('8 to 16'),
      'Validation: Rejects password under 8 characters'
    );

    const longPassRes = await request('POST', '/auth/register', {
      name: 'Vikas Shrikant Deshmukh',
      email: 'longpass@example.com',
      address: 'Shop 12, FC Road, Pune 411005',
      password: 'Password123456789!',
    });
    assert(
      longPassRes.status === 400 && longPassRes.body.message.includes('8 to 16'),
      'Validation: Rejects password over 16 characters'
    );

    const longAddressRes = await request('POST', '/auth/register', {
      name: 'Vikas Shrikant Deshmukh',
      email: 'longaddr@example.com',
      address: 'A'.repeat(401),
      password: 'Password123!',
    });
    assert(
      longAddressRes.status === 400 && longAddressRes.body.message.includes('cannot exceed 400'),
      'Validation: Rejects address over 400 characters'
    );

    const badEmailRes = await request('POST', '/auth/register', {
      name: 'Vikas Shrikant Deshmukh',
      email: 'invalid-email-format',
      address: 'Shop 12, FC Road, Pune 411005',
      password: 'Password123!',
    });
    assert(
      badEmailRes.status === 400 && badEmailRes.body.message.includes('valid email'),
      'Validation: Rejects invalid email syntax'
    );

    const dupEmailRes = await request('POST', '/auth/register', {
      name: 'Duplicate Email Account',
      email: 'RAHUL.VERMA@EXAMPLE.COM',
      address: 'Shop 12, FC Road, Pune 411005',
      password: 'Password123!',
    });
    assert(
      dupEmailRes.status === 409,
      'Validation: Rejects duplicate email regardless of casing (409 Conflict)'
    );

    const adminLogin = await request('POST', '/auth/login', {
      email: 'rahul.verma@example.com',
      password: 'AdminPassword123!',
    });
    assert(
      adminLogin.status === 200 && adminLogin.body.user.role === 'ADMIN',
      'Role Auth: Admin login authenticates successfully'
    );
    const adminToken = adminLogin.body.token;

    const adminStats = await request('GET', '/admin/dashboard', null, adminToken);
    assert(
      adminStats.status === 200 &&
        typeof adminStats.body.data.totalUsers === 'number' &&
        typeof adminStats.body.data.totalStores === 'number' &&
        typeof adminStats.body.data.totalRatings === 'number',
      'Admin: Dashboard returns valid aggregate statistics'
    );

    const adminStores = await request('GET', '/admin/stores?sortBy=name&sortOrder=asc&limit=5', null, adminToken);
    assert(
      adminStores.status === 200 && Array.isArray(adminStores.body.data) && adminStores.body.data.length > 0,
      'Admin: Stores endpoint supports sorting and pagination'
    );

    const adminUsers = await request('GET', '/admin/users?role=STORE_OWNER', null, adminToken);
    assert(
      adminUsers.status === 200 && adminUsers.body.data.every((u) => u.role === 'STORE_OWNER'),
      'Admin: Users endpoint filters correctly by role'
    );

    const ownerUserId = adminUsers.body.data[0].id;
    const userDetails = await request('GET', `/admin/users/${ownerUserId}`, null, adminToken);
    assert(
      userDetails.status === 200 &&
        userDetails.body.data.role === 'STORE_OWNER' &&
        Array.isArray(userDetails.body.data.associatedStores),
      'Admin: User details inspection includes linked stores for store owners'
    );

    const badRoleRes = await request(
      'POST',
      '/admin/users',
      {
        name: 'New Custom User Account',
        email: 'customrole@example.com',
        address: 'MG Road, Pune 411001',
        password: 'Password123!',
        role: 'SUPERUSER',
      },
      adminToken
    );
    assert(
      badRoleRes.status === 400 && badRoleRes.body.message.includes('Invalid role'),
      'Validation: Admin creation rejects invalid roles'
    );

    const badOwnerIdRes = await request(
      'POST',
      '/admin/stores',
      {
        name: 'Newly Created Retail Mart',
        email: 'newmart@example.com',
        address: 'Station Road, Pune 411001',
        ownerId: -10,
      },
      adminToken
    );
    assert(
      badOwnerIdRes.status === 400 && badOwnerIdRes.body.message.includes('positive integer'),
      'Validation: Rejects non-positive integer owner ID'
    );

    const userLogin = await request('POST', '/auth/login', {
      email: 'aarav.sharma@example.com',
      password: 'UserPassword123!',
    });
    assert(
      userLogin.status === 200 && userLogin.body.user.role === 'USER',
      'Role Auth: Normal user login authenticates successfully'
    );
    const userToken = userLogin.body.token;

    const emptySearchRes = await request('GET', '/stores?search=nonexistentstorenamestringxyz');
    assert(
      emptySearchRes.status === 200 && emptySearchRes.body.data.length === 0,
      'Store Search: Handles empty search results cleanly'
    );

    const badStoreIdRatingRes = await request(
      'POST',
      '/ratings',
      { storeId: -5, rating: 4 },
      userToken
    );
    assert(
      badStoreIdRatingRes.status === 400 && badStoreIdRatingRes.body.message.includes('positive integer'),
      'Validation: Rejects negative integer store ID'
    );

    const outOfBoundsRatingRes = await request(
      'POST',
      '/ratings',
      { storeId: 1, rating: 6 },
      userToken
    );
    assert(
      outOfBoundsRatingRes.status === 400 && outOfBoundsRatingRes.body.message.includes('between 1 and 5'),
      'Validation: Rejects rating value outside 1-5'
    );

    const adminRatingAttempt = await request(
      'POST',
      '/ratings',
      { storeId: 1, rating: 5 },
      adminToken
    );
    assert(
      adminRatingAttempt.status === 403,
      'Role Auth: Administrator is denied rating submission (403 Forbidden)'
    );

    const ownerLogin = await request('POST', '/auth/login', {
      email: 'rohan.patil@example.com',
      password: 'OwnerPassword123!',
    });
    assert(
      ownerLogin.status === 200 && ownerLogin.body.user.role === 'STORE_OWNER',
      'Role Auth: Store owner login authenticates successfully'
    );
    const ownerToken = ownerLogin.body.token;

    const ownerRatingAttempt = await request(
      'POST',
      '/ratings',
      { storeId: 1, rating: 5 },
      ownerToken
    );
    assert(
      ownerRatingAttempt.status === 403,
      'Role Auth: Store owner is denied rating submission (403 Forbidden)'
    );

    const validRatingRes = await request(
      'POST',
      '/ratings',
      { storeId: 1, rating: 5 },
      userToken
    );
    assert(
      validRatingRes.status === 200 &&
        validRatingRes.body.storeSummary &&
        typeof validRatingRes.body.storeSummary.overall_rating === 'number',
      'Normal User: Submits rating and store average recalculates'
    );

    const modifyRatingRes = await request(
      'PUT',
      '/ratings/1',
      { rating: 4 },
      userToken
    );
    assert(
      modifyRatingRes.status === 200 && modifyRatingRes.body.data.rating === 4,
      'Normal User: Modifies their existing rating successfully'
    );

    const ownerStores = await request('GET', '/owner/stores', null, ownerToken);
    assert(
      ownerStores.status === 200 && Array.isArray(ownerStores.body.data) && ownerStores.body.data.length > 0,
      'Store Owner: Dashboard returns assigned stores and averages'
    );

    const ownStoreId = ownerStores.body.data[0].id;
    const ownRatings = await request('GET', `/owner/stores/${ownStoreId}/ratings`, null, ownerToken);
    assert(
      ownRatings.status === 200 && Array.isArray(ownRatings.body.data),
      'Store Owner: Views customer ratings and submission details for owned store'
    );

    const foreignStoreRatings = await request('GET', '/owner/stores/5/ratings', null, ownerToken);
    assert(
      foreignStoreRatings.status === 403,
      'Data Isolation: Store owner cannot inspect foreign store ratings (403 Forbidden)'
    );

    const userAdminAccess = await request('GET', '/admin/dashboard', null, userToken);
    assert(
      userAdminAccess.status === 403,
      'Role Auth: Normal user cannot access /api/admin/dashboard (403 Forbidden)'
    );

    const userOwnerAccess = await request('GET', '/owner/stores', null, userToken);
    assert(
      userOwnerAccess.status === 403,
      'Role Auth: Normal user cannot access /api/owner/stores (403 Forbidden)'
    );

    const uniqueTimestamp = Date.now();
    const newStoreName = `Apex Supermarket Express ${uniqueTimestamp}`.slice(0, 50);
    const newStoreEmail = `store${uniqueTimestamp}@example.com`;

    const createStoreRes = await request(
      'POST',
      '/admin/stores',
      {
        name: newStoreName,
        email: newStoreEmail,
        address: '100 Feet Ring Road, Banashankari, Bengaluru, Karnataka 560085',
        ownerId: ownerUserId,
      },
      adminToken
    );
    assert(
      createStoreRes.status === 201 && createStoreRes.body.data.id,
      'End-to-End Workflow: Admin creates store and assigns to store owner'
    );
    const newStoreId = createStoreRes.body.data.id;

    const rateNewStoreRes = await request(
      'POST',
      '/ratings',
      { storeId: newStoreId, rating: 5 },
      userToken
    );
    assert(
      rateNewStoreRes.status === 200 && rateNewStoreRes.body.data.rating === 5,
      'End-to-End Workflow: Normal user rates the newly created store'
    );

    const ownerNewStoreRatings = await request(
      'GET',
      `/owner/stores/${newStoreId}/ratings`,
      null,
      ownerToken
    );
    assert(
      ownerNewStoreRatings.status === 200 &&
        ownerNewStoreRatings.body.data.some((r) => r.rating === 5),
      'End-to-End Workflow: Store owner sees the new rating on their dashboard'
    );

    console.log(`\nTest results: ${passed} passed, ${failed} failed.\n`);

    if (failed > 0) {
      process.exit(1);
    }
  } catch (err) {
    console.error('Test execution failed:', err);
    process.exit(1);
  }
}

runTestSuite();

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
  console.log('Running integration tests for Store Rating Platform...\n');

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
    // 1. Health check
    const health = await request('GET', '/health');
    assert(health.status === 200 && health.body.status === 'healthy', 'GET /api/health returns 200 and healthy status');

    // 2. Validation boundary checks
    const shortNameRes = await request('POST', '/auth/register', {
      name: 'Christopher Short', // 17 chars
      email: 'shortname@example.com',
      address: 'Valid residential address 100 Main St',
      password: 'Password123!',
    });
    assert(
      shortNameRes.status === 400 && shortNameRes.body.message.includes('20 and 60 characters'),
      'POST /api/auth/register rejects name under 20 characters',
      shortNameRes.body.message
    );

    const weakPassRes = await request('POST', '/auth/register', {
      name: 'Christopher Long Full Name', // 26 chars
      email: 'weakpass@example.com',
      address: 'Valid residential address 100 Main St',
      password: 'password123!',
    });
    assert(
      weakPassRes.status === 400 && weakPassRes.body.message.includes('uppercase letter'),
      'POST /api/auth/register rejects password missing uppercase'
    );

    const noSpecialPassRes = await request('POST', '/auth/register', {
      name: 'Christopher Long Full Name',
      email: 'nospecial@example.com',
      address: 'Valid residential address 100 Main St',
      password: 'Password1234',
    });
    assert(
      noSpecialPassRes.status === 400 && noSpecialPassRes.body.message.includes('special character'),
      'POST /api/auth/register rejects password missing special character'
    );

    const longAddressRes = await request('POST', '/auth/register', {
      name: 'Christopher Long Full Name',
      email: 'longaddr@example.com',
      address: 'A'.repeat(401),
      password: 'Password123!',
    });
    assert(
      longAddressRes.status === 400 && longAddressRes.body.message.includes('cannot exceed 400'),
      'POST /api/auth/register rejects address over 400 characters'
    );

    // 3. Admin workflow
    const adminLogin = await request('POST', '/auth/login', {
      email: 'admin@platform.com',
      password: 'AdminPassword123!',
    });
    assert(
      adminLogin.status === 200 && adminLogin.body.user.role === 'ADMIN',
      'POST /api/auth/login authenticates admin and returns token'
    );
    const adminToken = adminLogin.body.token;

    const adminStats = await request('GET', '/admin/dashboard', null, adminToken);
    assert(
      adminStats.status === 200 &&
        typeof adminStats.body.data.totalUsers === 'number' &&
        typeof adminStats.body.data.totalStores === 'number' &&
        typeof adminStats.body.data.totalRatings === 'number',
      'GET /api/admin/dashboard returns valid aggregate counts'
    );

    const adminStores = await request('GET', '/admin/stores?sortBy=name&sortOrder=asc&limit=5', null, adminToken);
    assert(
      adminStores.status === 200 && Array.isArray(adminStores.body.data) && adminStores.body.data.length > 0,
      'GET /api/admin/stores returns paginated store list'
    );

    const adminUsers = await request('GET', '/admin/users?role=STORE_OWNER', null, adminToken);
    assert(
      adminUsers.status === 200 && adminUsers.body.data.every((u) => u.role === 'STORE_OWNER'),
      'GET /api/admin/users filters correctly by role'
    );

    const ownerUserId = adminUsers.body.data[0].id;
    const userDetails = await request('GET', `/admin/users/${ownerUserId}`, null, adminToken);
    assert(
      userDetails.status === 200 &&
        userDetails.body.data.role === 'STORE_OWNER' &&
        Array.isArray(userDetails.body.data.associatedStores),
      'GET /api/admin/users/:id includes store info for store owners'
    );

    // 4. Normal user workflow
    const userLogin = await request('POST', '/auth/login', {
      email: 'user1@example.com',
      password: 'UserPassword123!',
    });
    assert(userLogin.status === 200 && userLogin.body.user.role === 'USER', 'POST /api/auth/login authenticates normal user');
    const userToken = userLogin.body.token;

    const invalidRatingRes = await request(
      'POST',
      '/ratings',
      { storeId: 1, rating: 6 },
      userToken
    );
    assert(
      invalidRatingRes.status === 400 && invalidRatingRes.body.message.includes('between 1 and 5'),
      'POST /api/ratings rejects ratings outside 1-5'
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
      'POST /api/ratings saves rating and recalculates store average'
    );

    // 5. Store owner workflow & data isolation
    const ownerLogin = await request('POST', '/auth/login', {
      email: 'owner@applecentral.com',
      password: 'OwnerPassword123!',
    });
    assert(
      ownerLogin.status === 200 && ownerLogin.body.user.role === 'STORE_OWNER',
      'POST /api/auth/login authenticates store owner'
    );
    const ownerToken = ownerLogin.body.token;

    const ownerStores = await request('GET', '/owner/stores', null, ownerToken);
    assert(
      ownerStores.status === 200 && Array.isArray(ownerStores.body.data) && ownerStores.body.data.length > 0,
      'GET /api/owner/stores returns owned stores'
    );

    const ownStoreId = ownerStores.body.data[0].id;
    const ownRatings = await request('GET', `/owner/stores/${ownStoreId}/ratings`, null, ownerToken);
    assert(
      ownRatings.status === 200 && Array.isArray(ownRatings.body.data),
      'GET /api/owner/stores/:id/ratings returns customer ratings for owned store'
    );

    const unownedStoreRatings = await request('GET', '/owner/stores/2/ratings', null, ownerToken);
    assert(
      unownedStoreRatings.status === 403,
      'GET /api/owner/stores/:id/ratings denies access to foreign stores (403 Forbidden)'
    );

    // 6. Role protection
    const unauthAdminAccess = await request('GET', '/admin/dashboard', null, userToken);
    assert(
      unauthAdminAccess.status === 403,
      'Normal user cannot access /api/admin/dashboard (403 Forbidden)'
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

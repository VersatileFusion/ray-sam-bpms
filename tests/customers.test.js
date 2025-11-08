const request = require('supertest');
const app = require('../index');
const User = require('../models/User');
const Customer = require('../models/Customer');
const testData = require('./helpers/testData');

describe('Customer Management API', () => {
  let adminUser;
  let adminCookies;

  beforeEach(async () => {
    // Ensure admin user exists
    adminUser = new User({
      username: testData.admin.username,
      password: testData.admin.password,
      name: testData.admin.name,
      role: 'admin'
    });
    await adminUser.save();

    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({
        username: testData.admin.username,
        password: testData.admin.password
      });

    adminCookies = loginRes.headers['set-cookie'];
  });

  afterEach(async () => {
    await Customer.deleteMany({});
    await User.deleteMany({});
  });

  it('should allow admin to create and fetch customers', async () => {
    const payload = {
      name: 'مشتری تستی',
      companyName: 'شرکت فناوری تست',
      status: 'active',
      tier: 'gold',
      tags: ['VIP', 'اولویت بالا'],
      contacts: [{
        name: 'خانم رضایی',
        email: 'rezaei@example.com',
        phone: '09120000000',
        position: 'مدیر فناوری',
        isPrimary: true
      }]
    };

    const createRes = await request(app)
      .post('/api/customers')
      .set('Cookie', adminCookies)
      .send(payload);

    expect(createRes.status).toBe(201);
    expect(createRes.body.success).toBe(true);
    expect(createRes.body.data.customer.name).toBe(payload.name);

    const listRes = await request(app)
      .get('/api/customers')
      .set('Cookie', adminCookies);

    expect(listRes.status).toBe(200);
    expect(listRes.body.success).toBe(true);
    expect(listRes.body.data.length).toBe(1);

    const customerId = createRes.body.data.customer._id;
    const insightsRes = await request(app)
      .get(`/api/customers/${customerId}/insights`)
      .set('Cookie', adminCookies);

    expect(insightsRes.status).toBe(200);
    expect(insightsRes.body.success).toBe(true);
    expect(insightsRes.body.data.customer._id).toBe(customerId);
  });

  it('should update and archive a customer', async () => {
    const customer = await Customer.create({
      name: 'مشتری اولیه',
      status: 'active',
      tier: 'standard',
      createdBy: { userId: adminUser._id, name: adminUser.name },
      updatedBy: { userId: adminUser._id, name: adminUser.name }
    });

    const updateRes = await request(app)
      .put(`/api/customers/${customer._id}`)
      .set('Cookie', adminCookies)
      .send({ tier: 'platinum', status: 'prospect' });

    expect(updateRes.status).toBe(200);
    expect(updateRes.body.data.customer.tier).toBe('platinum');
    expect(updateRes.body.data.customer.status).toBe('prospect');

    const archiveRes = await request(app)
      .delete(`/api/customers/${customer._id}`)
      .set('Cookie', adminCookies);

    expect(archiveRes.status).toBe(200);
    expect(archiveRes.body.success).toBe(true);

    const archivedCustomer = await Customer.findById(customer._id);
    expect(archivedCustomer.status).toBe('inactive');
  });
});


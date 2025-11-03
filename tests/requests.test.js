const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../index');
const User = require('../models/User');
const Request = require('../models/Request');
const RequestHistory = require('../models/RequestHistory');
const testData = require('./helpers/testData');

describe('Requests API', () => {
  let adminUser, normalUser, customerUser;
  let adminCookies, normalCookies, customerCookies;

  beforeEach(async () => {
    // Create test users from users-data.json
    adminUser = new User(testData.admin);
    await adminUser.save();

    normalUser = new User(testData.users[0]);
    await normalUser.save();

    customerUser = new User(testData.customers[0]);
    await customerUser.save();

    // Login as admin
    const adminLogin = await request(app)
      .post('/api/auth/login')
      .send({ username: testData.admin.username, password: testData.admin.password });
    adminCookies = adminLogin.headers['set-cookie'];

    // Login as normal user
    const normalLogin = await request(app)
      .post('/api/auth/login')
      .send({ username: testData.users[0].username, password: testData.users[0].password });
    normalCookies = normalLogin.headers['set-cookie'];

    // Login as customer
    const customerLogin = await request(app)
      .post('/api/auth/login')
      .send({ username: testData.customers[0].username, password: testData.customers[0].password });
    customerCookies = customerLogin.headers['set-cookie'];
  });

  // Cleanup handled by setup.js
  // afterEach(async () => {
  //   await User.deleteMany({});
  //   await Request.deleteMany({});
  //   await RequestHistory.deleteMany({});
  // });

  describe('POST /api/requests', () => {
    it('should create a request successfully', async () => {
      const res = await request(app)
        .post('/api/requests')
        .set('Cookie', adminCookies)
        .send({
          date: '1402/01/15',
          customerName: 'Test Customer',
          customerPhone: '09123456789',
          userName: 'Test User',
          system: 'مالی',
          request: 'Test request description',
          requestType: 'رفع باگ',
          actionDescription: 'Action taken',
          status: 'باز',
          priority: 'متوسط'
        });

      expect(res.status).toBe(201);
      expect(res.body.message).toBe('Request created successfully.');
    });

    it('should enforce "باز" status for customers', async () => {
      const res = await request(app)
        .post('/api/requests')
        .set('Cookie', customerCookies)
        .send({
          date: '1402/01/15',
          customerName: 'Test Customer',
          customerPhone: '09123456789',
          userName: 'Test User',
          system: 'مالی',
          request: 'Test request',
          requestType: 'رفع باگ',
          status: 'انجام' // Trying to set different status
        });

      expect(res.status).toBe(201);
      const request = await Request.findOne({ customerName: 'Test Customer' });
      expect(request.status).toBe('باز'); // Should be forced to باز
    });

    it('should return 400 with missing required fields', async () => {
      const res = await request(app)
        .post('/api/requests')
        .set('Cookie', adminCookies)
        .send({
          date: '1402/01/15',
          customerName: 'Test Customer'
          // Missing required fields
        });

      expect(res.status).toBe(400);
    });

    it('should require authentication', async () => {
      const res = await request(app)
        .post('/api/requests')
        .send({
          date: '1402/01/15',
          customerName: 'Test Customer',
          customerPhone: '09123456789',
          userName: 'Test User',
          system: 'مالی',
          request: 'Test request',
          requestType: 'رفع باگ',
          status: 'باز'
        });

      expect(res.status).toBe(401);
    });
  });

  describe('GET /api/requests', () => {
    beforeEach(async () => {
      // Create test requests
      await Request.create({
        date: '2024-01-15',
        customerName: 'Customer 1',
        userName: 'User 1',
        system: 'مالی',
        request: 'Request 1',
        requestType: 'رفع باگ',
        status: 'باز',
        createdBy: { userId: adminUser._id, name: adminUser.name }
      });

      await Request.create({
        date: '2024-01-16',
        customerName: 'Customer 2',
        userName: 'User 2',
        system: 'انبار',
        request: 'Request 2',
        requestType: 'گزارش جدید',
        status: 'انجام',
        createdBy: { userId: customerUser._id, name: customerUser.name }
      });
    });

    it('should get all requests for admin/user', async () => {
      const res = await request(app)
        .get('/api/requests')
        .set('Cookie', adminCookies);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBe(2);
    });

    it('should only return customer\'s own requests', async () => {
      const res = await request(app)
        .get('/api/requests')
        .set('Cookie', customerCookies);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBe(1);
      expect(res.body[0].customerName).toBe('Customer 2');
    });
  });

  describe('GET /api/requests/:id', () => {
    let testRequest;

    beforeEach(async () => {
      testRequest = await Request.create({
        date: '2024-01-15',
        customerName: 'Test Customer',
        userName: 'Test User',
        system: 'مالی',
        request: 'Test request',
        requestType: 'رفع باگ',
        status: 'باز',
        createdBy: { userId: adminUser._id, name: adminUser.name }
      });
    });

    it('should get request by ID', async () => {
      const res = await request(app)
        .get(`/api/requests/${testRequest._id}`)
        .set('Cookie', adminCookies);

      expect(res.status).toBe(200);
      expect(res.body._id.toString()).toBe(testRequest._id.toString());
      expect(res.body.customerName).toBe('Test Customer');
    });

    it('should return 404 for non-existent request', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const res = await request(app)
        .get(`/api/requests/${fakeId}`)
        .set('Cookie', adminCookies);

      expect(res.status).toBe(404);
    });

    it('should prevent customers from viewing others\' requests', async () => {
      // Request created by admin
      const res = await request(app)
        .get(`/api/requests/${testRequest._id}`)
        .set('Cookie', customerCookies);

      expect(res.status).toBe(403);
    });
  });

  describe('PUT /api/requests/:id', () => {
    let testRequest;

    beforeEach(async () => {
      testRequest = await Request.create({
        date: '2024-01-15',
        customerName: 'Test Customer',
        userName: 'Test User',
        system: 'مالی',
        request: 'Test request',
        requestType: 'رفع باگ',
        status: 'باز',
        createdBy: { userId: adminUser._id, name: adminUser.name }
      });
    });

    it('should update request successfully', async () => {
      const res = await request(app)
        .put(`/api/requests/${testRequest._id}`)
        .set('Cookie', adminCookies)
        .send({
          status: 'انجام',
          priority: 'فوری'
        });

      expect(res.status).toBe(200);
      expect(res.body.status).toBe('انجام');
      expect(res.body.priority).toBe('فوری');

      // Check history was created
      const history = await RequestHistory.findOne({ requestId: testRequest._id });
      expect(history).toBeDefined();
      expect(history.changedFields.length).toBeGreaterThan(0);
    });

    it('should prevent customers from updating others\' requests', async () => {
      const res = await request(app)
        .put(`/api/requests/${testRequest._id}`)
        .set('Cookie', customerCookies)
        .send({
          status: 'انجام'
        });

      expect(res.status).toBe(403);
    });
  });

  describe('GET /api/requests/search', () => {
    beforeEach(async () => {
      await Request.create({
        date: '2024-01-15',
        customerName: 'Customer One',
        userName: 'User One',
        system: 'مالی',
        request: 'Bug fix request',
        requestType: 'رفع باگ',
        status: 'باز'
      });

      await Request.create({
        date: '2024-01-16',
        customerName: 'Customer Two',
        userName: 'User Two',
        system: 'انبار',
        request: 'New report request',
        requestType: 'گزارش جدید',
        status: 'انجام'
      });
    });

    it('should search by customer name', async () => {
      const res = await request(app)
        .get('/api/requests/search')
        .set('Cookie', adminCookies)
        .query({ customerName: 'Customer One' });

      expect(res.status).toBe(200);
      expect(res.body.length).toBe(1);
      expect(res.body[0].customerName).toBe('Customer One');
    });

    it('should search by status', async () => {
      const res = await request(app)
        .get('/api/requests/search')
        .set('Cookie', adminCookies)
        .query({ status: 'انجام' });

      expect(res.status).toBe(200);
      expect(res.body.length).toBe(1);
      expect(res.body[0].status).toBe('انجام');
    });

    it('should search by system', async () => {
      const res = await request(app)
        .get('/api/requests/search')
        .set('Cookie', adminCookies)
        .query({ system: 'مالی' });

      expect(res.status).toBe(200);
      expect(res.body.length).toBe(1);
      expect(res.body[0].system).toBe('مالی');
    });
  });

  describe('POST /api/requests/:id/comments', () => {
    let testRequest;

    beforeEach(async () => {
      testRequest = await Request.create({
        date: '2024-01-15',
        customerName: 'Test Customer',
        userName: 'Test User',
        system: 'مالی',
        request: 'Test request',
        requestType: 'رفع باگ',
        status: 'باز',
        createdBy: { userId: adminUser._id, name: adminUser.name }
      });
    });

    it('should add comment successfully', async () => {
      const res = await request(app)
        .post(`/api/requests/${testRequest._id}/comments`)
        .set('Cookie', adminCookies)
        .send({ comment: 'This is a test comment' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);

      const request = await Request.findById(testRequest._id);
      expect(request.comments.length).toBe(1);
      expect(request.comments[0].text).toBe('This is a test comment');
    });

    it('should return 400 with empty comment', async () => {
      const res = await request(app)
        .post(`/api/requests/${testRequest._id}/comments`)
        .set('Cookie', adminCookies)
        .send({ comment: '' });

      expect(res.status).toBe(400);
    });
  });

  describe('POST /api/requests/:id/attachments', () => {
    let testRequest;

    beforeEach(async () => {
      testRequest = await Request.create({
        date: '2024-01-15',
        customerName: 'Test Customer',
        userName: 'Test User',
        system: 'مالی',
        request: 'Test request',
        requestType: 'رفع باگ',
        status: 'باز',
        createdBy: { userId: adminUser._id, name: adminUser.name }
      });
    });

    it('should upload attachment successfully', async () => {
      const res = await request(app)
        .post(`/api/requests/${testRequest._id}/attachments`)
        .set('Cookie', adminCookies)
        .attach('file', Buffer.from('test file content'), 'test.txt')
        .expect(200);

      expect(res.body.success).toBe(true);
      
      const request = await Request.findById(testRequest._id);
      expect(request.attachments.length).toBe(1);
      expect(request.attachments[0].originalName).toBe('test.txt');
    });

    it('should return 400 without file', async () => {
      const res = await request(app)
        .post(`/api/requests/${testRequest._id}/attachments`)
        .set('Cookie', adminCookies)
        .expect(400);

      expect(res.body.success).toBe(false);
    });
  });

  describe('POST /api/requests/:id/assign', () => {
    let testRequest;

    beforeEach(async () => {
      testRequest = await Request.create({
        date: '2024-01-15',
        customerName: 'Test Customer',
        userName: 'Test User',
        system: 'مالی',
        request: 'Test request',
        requestType: 'رفع باگ',
        status: 'باز',
        createdBy: { userId: adminUser._id, name: adminUser.name }
      });
    });

    it('should assign request to user', async () => {
      const res = await request(app)
        .post(`/api/requests/${testRequest._id}/assign`)
        .set('Cookie', adminCookies)
        .send({ userId: normalUser._id });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);

      const request = await Request.findById(testRequest._id);
      expect(request.assignedTo.userId.toString()).toBe(normalUser._id.toString());
      expect(request.assignedTo.name).toBe(normalUser.name);
    });
  });

  describe('POST /api/requests/bulk/update', () => {
    let request1, request2;

    beforeEach(async () => {
      request1 = await Request.create({
        date: '2024-01-15',
        customerName: 'Customer 1',
        userName: 'User 1',
        system: 'مالی',
        request: 'Request 1',
        requestType: 'رفع باگ',
        status: 'باز',
        createdBy: { userId: adminUser._id, name: adminUser.name }
      });

      request2 = await Request.create({
        date: '2024-01-16',
        customerName: 'Customer 2',
        userName: 'User 2',
        system: 'انبار',
        request: 'Request 2',
        requestType: 'گزارش جدید',
        status: 'باز',
        createdBy: { userId: adminUser._id, name: adminUser.name }
      });
    });

    it('should bulk update requests', async () => {
      const res = await request(app)
        .post('/api/requests/bulk/update')
        .set('Cookie', adminCookies)
        .send({
          ids: [request1._id, request2._id],
          updates: { status: 'انجام' }
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.modifiedCount).toBe(2);

      const updated1 = await Request.findById(request1._id);
      const updated2 = await Request.findById(request2._id);
      expect(updated1.status).toBe('انجام');
      expect(updated2.status).toBe('انجام');
    });

    it('should return 400 without ids', async () => {
      const res = await request(app)
        .post('/api/requests/bulk/update')
        .set('Cookie', adminCookies)
        .send({
          updates: { status: 'انجام' }
        });

      expect(res.status).toBe(400);
    });
  });
});


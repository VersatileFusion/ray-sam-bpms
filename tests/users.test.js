const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../index');
const User = require('../models/User');
const testData = require('./helpers/testData');

describe('User Management API', () => {
  let adminUser, normalUser;
  let adminCookies, normalCookies;

  beforeEach(async () => {
    // Create test users from users-data.json
    adminUser = new User(testData.admin);
    await adminUser.save();

    normalUser = new User(testData.users[0]);
    await normalUser.save();

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
  });

  // Don't clean up after each test - the setup.js already does this
  // afterEach(async () => {
  //   await User.deleteMany({});
  // });

  describe('GET /api/users', () => {
    it('should get all users', async () => {
      const res = await request(app)
        .get('/api/users')
        .set('Cookie', adminCookies);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.users)).toBe(true);
      expect(res.body.users.length).toBe(2);
      // Check passwords are not included
      res.body.users.forEach(user => {
        expect(user.password).toBeUndefined();
      });
    });

    it('should require authentication', async () => {
      const res = await request(app)
        .get('/api/users');

      expect(res.status).toBe(401);
    });

    it('should sort users by name', async () => {
      const res = await request(app)
        .get('/api/users')
        .set('Cookie', adminCookies);

      expect(res.status).toBe(200);
      const names = res.body.users.map(u => u.name);
      expect(names[0] < names[1]).toBe(true); // Should be sorted
    });
  });

  describe('GET /api/users/:id', () => {
    it('should get user by ID', async () => {
      const res = await request(app)
        .get(`/api/users/${normalUser._id}`)
        .set('Cookie', adminCookies);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.user._id.toString()).toBe(normalUser._id.toString());
      expect(res.body.user.username).toBe(testData.users[0].username);
      expect(res.body.user.password).toBeUndefined();
    });

    it('should return 404 for non-existent user', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const res = await request(app)
        .get(`/api/users/${fakeId}`)
        .set('Cookie', adminCookies);

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
    });
  });

  describe('POST /api/admin/users', () => {
    it('should create user successfully as admin', async () => {
      const res = await request(app)
        .post('/api/admin/users')
        .set('Cookie', adminCookies)
        .send({
          username: 'newuser',
          password: 'NewUser@2024!',
          name: 'New User',
          role: 'user'
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.user.username).toBe('newuser');

      // Verify user was created in database
      const user = await User.findOne({ username: 'newuser' });
      expect(user).toBeDefined();
      expect(user.name).toBe('New User');
      
      // Verify password is hashed
      expect(user.password).not.toBe('NewUser@2024!');
      const isValid = await user.comparePassword('NewUser@2024!');
      expect(isValid).toBe(true);
    });

    it('should return 403 for non-admin users', async () => {
      const res = await request(app)
        .post('/api/admin/users')
        .set('Cookie', normalCookies)
        .send({
          username: 'newuser2',
          password: 'NewUser2@2024!',
          name: 'New User 2',
          role: 'user'
        });

      expect(res.status).toBe(403);
    });

    it('should return 400 for duplicate username', async () => {
      const res = await request(app)
        .post('/api/admin/users')
        .set('Cookie', adminCookies)
        .send({
          username: testData.admin.username, // Already exists
          password: 'NewPass@2024!',
          name: 'New Admin',
          role: 'user'
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('should default role to user', async () => {
      const res = await request(app)
        .post('/api/admin/users')
        .set('Cookie', adminCookies)
        .send({
          username: 'newuser3',
          password: 'NewUser3@2024!',
          name: 'New User 3'
          // No role specified
        });

      expect(res.status).toBe(201);
      const user = await User.findOne({ username: 'newuser3' });
      expect(user.role).toBe('user');
    });
  });

  describe('PUT /api/admin/users/:id', () => {
    it('should update user successfully', async () => {
      const res = await request(app)
        .put(`/api/admin/users/${normalUser._id}`)
        .set('Cookie', adminCookies)
        .send({
          name: 'Updated Name',
          role: 'admin',
          isActive: false
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);

      const user = await User.findById(normalUser._id);
      expect(user.name).toBe('Updated Name');
      expect(user.role).toBe('admin');
      expect(user.isActive).toBe(false);
    });

    it('should return 403 for non-admin users', async () => {
      const res = await request(app)
        .put(`/api/admin/users/${normalUser._id}`)
        .set('Cookie', normalCookies)
        .send({
          name: 'Updated Name'
        });

      expect(res.status).toBe(403);
    });

    it('should return 404 for non-existent user', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const res = await request(app)
        .put(`/api/admin/users/${fakeId}`)
        .set('Cookie', adminCookies)
        .send({
          name: 'Updated Name'
        });

      expect(res.status).toBe(404);
    });

    it('should only update provided fields', async () => {
      const originalRole = normalUser.role;
      const res = await request(app)
        .put(`/api/admin/users/${normalUser._id}`)
        .set('Cookie', adminCookies)
        .send({
          name: 'New Name'
          // Not updating role
        });

      expect(res.status).toBe(200);
      const user = await User.findById(normalUser._id);
      expect(user.name).toBe('New Name');
      expect(user.role).toBe(originalRole); // Should remain unchanged
    });
  });

  describe('DELETE /api/admin/users/:id', () => {
    it('should delete user successfully', async () => {
      const res = await request(app)
        .delete(`/api/admin/users/${normalUser._id}`)
        .set('Cookie', adminCookies);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);

      const user = await User.findById(normalUser._id);
      expect(user).toBeNull();
    });

    it('should prevent deleting yourself', async () => {
      const res = await request(app)
        .delete(`/api/admin/users/${adminUser._id}`)
        .set('Cookie', adminCookies);

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);

      const user = await User.findById(adminUser._id);
      expect(user).toBeDefined(); // Should still exist
    });

    it('should return 403 for non-admin users', async () => {
      const res = await request(app)
        .delete(`/api/admin/users/${adminUser._id}`)
        .set('Cookie', normalCookies);

      expect(res.status).toBe(403);
    });
  });

  describe('POST /api/admin/users/:id/reset-password', () => {
    it('should reset password successfully', async () => {
      const res = await request(app)
        .post(`/api/admin/users/${normalUser._id}/reset-password`)
        .set('Cookie', adminCookies)
        .send({
          newPassword: 'NewPassword@2024!'
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);

      const user = await User.findById(normalUser._id);
      const isValid = await user.comparePassword('NewPassword@2024!');
      expect(isValid).toBe(true);
    });

    it('should return 400 for short password', async () => {
      const res = await request(app)
        .post(`/api/admin/users/${normalUser._id}/reset-password`)
        .set('Cookie', adminCookies)
        .send({
          newPassword: '123' // Too short
        });

      expect(res.status).toBe(400);
    });

    it('should return 403 for non-admin users', async () => {
      const res = await request(app)
        .post(`/api/admin/users/${normalUser._id}/reset-password`)
        .set('Cookie', normalCookies)
        .send({
          newPassword: 'NewPassword@2024!'
        });

      expect(res.status).toBe(403);
    });

    it('should return 404 for non-existent user', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const res = await request(app)
        .post(`/api/admin/users/${fakeId}/reset-password`)
        .set('Cookie', adminCookies)
        .send({
          newPassword: 'NewPassword@2024!'
        });

      expect(res.status).toBe(404);
    });
  });
});


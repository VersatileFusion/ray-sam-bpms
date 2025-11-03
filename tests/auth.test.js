const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../index');
const User = require('../models/User');
const testData = require('./helpers/testData');

describe('Authentication API', () => {
  let testUser;

  beforeEach(async () => {
    // Create a test user from users-data.json
    const userData = testData.users[0]; // Use first user from users-data.json
    testUser = new User(userData);
    await testUser.save();
  });

  // Cleanup handled by setup.js
  // afterEach(async () => {
  //   await User.deleteMany({});
  // });

  describe('POST /api/auth/login', () => {
    it('should login successfully with correct credentials', async () => {
      const userData = testData.users[0];
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          username: userData.username,
          password: userData.password
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.user).toBeDefined();
      expect(res.body.user.username).toBe(userData.username);
      expect(res.body.user.password).toBeUndefined();
    });

    it('should return 401 with incorrect password', async () => {
      const userData = testData.users[0];
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          username: userData.username,
          password: 'wrongpassword'
        });

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it('should return 401 with non-existent username', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          username: 'nonexistent123',
          password: testData.users[0].password
        });

      expect(res.status).toBe(401);
    });

    it('should return 400 with missing credentials', async () => {
      const userData = testData.users[0];
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          username: userData.username
        });

      expect(res.status).toBe(400);
    });

    it('should not login inactive users', async () => {
      testUser.isActive = false;
      await testUser.save();

      const res = await request(app)
        .post('/api/auth/login')
        .send({
          username: testUser.username,
          password: testData.users[0].password
        });

      expect(res.status).toBe(401);
    });

    it('should update lastLogin on successful login', async () => {
      const initialLastLogin = testUser.lastLogin;
      const userData = testData.users[0];
      
      await request(app)
        .post('/api/auth/login')
        .send({
          username: userData.username,
          password: userData.password
        });

      const updatedUser = await User.findById(testUser._id);
      expect(updatedUser.lastLogin).toBeDefined();
      expect(updatedUser.lastLogin).not.toEqual(initialLastLogin);
    });
  });

  describe('POST /api/auth/logout', () => {
    it('should logout successfully', async () => {
      // First login to get session
      const userData = testData.users[0];
      const loginRes = await request(app)
        .post('/api/auth/login')
        .send({
          username: userData.username,
          password: userData.password
        });

      const cookies = loginRes.headers['set-cookie'];

      // Then logout
      const res = await request(app)
        .post('/api/auth/logout')
        .set('Cookie', cookies);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });

  describe('GET /api/auth/me', () => {
    it('should return current user when authenticated', async () => {
      // Login
      const userData = testData.users[0];
      const loginRes = await request(app)
        .post('/api/auth/login')
        .send({
          username: userData.username,
          password: userData.password
        });

      const cookies = loginRes.headers['set-cookie'];

      // Get current user
      const res = await request(app)
        .get('/api/auth/me')
        .set('Cookie', cookies);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.user).toBeDefined();
      expect(res.body.user.username).toBe(userData.username);
    });

    it('should return 401 when not authenticated', async () => {
      const res = await request(app)
        .get('/api/auth/me');

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });
  });

  describe('POST /api/auth/change-password', () => {
    it('should change password successfully', async () => {
      // Login
      const userData = testData.users[0];
      const loginRes = await request(app)
        .post('/api/auth/login')
        .send({
          username: userData.username,
          password: userData.password
        });

      const cookies = loginRes.headers['set-cookie'];

      // Change password
      const res = await request(app)
        .post('/api/auth/change-password')
        .set('Cookie', cookies)
        .send({
          currentPassword: userData.password,
          newPassword: 'NewPassword@2024!'
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);

      // Verify new password works
      const user = await User.findById(testUser._id);
      const isValid = await user.comparePassword('NewPassword@2024!');
      expect(isValid).toBe(true);
    });

    it('should return 400 with incorrect current password', async () => {
      const userData = testData.users[0];
      const loginRes = await request(app)
        .post('/api/auth/login')
        .send({
          username: userData.username,
          password: userData.password
        });

      const cookies = loginRes.headers['set-cookie'];

      const res = await request(app)
        .post('/api/auth/change-password')
        .set('Cookie', cookies)
        .send({
          currentPassword: 'wrongpassword',
          newPassword: 'newpassword123'
        });

      expect(res.status).toBe(400);
    });
  });
});


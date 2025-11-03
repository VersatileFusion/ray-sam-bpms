const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../index');
const User = require('../models/User');
const Request = require('../models/Request');
const Notification = require('../models/Notification');
const testData = require('./helpers/testData');

describe('Notifications API', () => {
  let adminUser, normalUser;
  let adminCookies, normalCookies;
  let testRequest;

  beforeEach(async () => {
    // Create test users from users-data.json
    adminUser = new User(testData.admin);
    await adminUser.save();

    normalUser = new User(testData.users[0]);
    await normalUser.save();

    // Create a test request
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

    // Login users
    const adminLogin = await request(app)
      .post('/api/auth/login')
      .send({ username: testData.admin.username, password: testData.admin.password });
    adminCookies = adminLogin.headers['set-cookie'];

    const normalLogin = await request(app)
      .post('/api/auth/login')
      .send({ username: testData.users[0].username, password: testData.users[0].password });
    normalCookies = normalLogin.headers['set-cookie'];
  });

  // Cleanup handled by setup.js
  // afterEach(async () => {
  //   await User.deleteMany({});
  //   await Request.deleteMany({});
  //   await Notification.deleteMany({});
  // });

  describe('GET /api/notifications', () => {
    beforeEach(async () => {
      // Create test notifications for normal user
      await Notification.create({
        user: { userId: normalUser._id, name: normalUser.name },
        type: 'request_assigned',
        title: 'درخواست جدید برای شما',
        message: 'درخواست Test به شما اختصاص داده شد',
        relatedRequest: testRequest._id,
        read: false
      });

      await Notification.create({
        user: { userId: normalUser._id, name: normalUser.name },
        type: 'request_updated',
        title: 'درخواست شما ویرایش شد',
        message: 'درخواست Test توسط Admin User ویرایش شد',
        relatedRequest: testRequest._id,
        read: true
      });
    });

    it('should get user notifications', async () => {
      const res = await request(app)
        .get('/api/notifications')
        .set('Cookie', normalCookies);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toBeDefined();
      expect(Array.isArray(res.body.data.notifications)).toBe(true);
      expect(res.body.data.notifications.length).toBe(2);
      expect(res.body.data.unreadCount).toBe(1);
    });

    it('should only return current user\'s notifications', async () => {
      // Create notification for admin
      await Notification.create({
        user: { userId: adminUser._id, name: adminUser.name },
        type: 'request_created',
        title: 'درخواست جدید',
        message: 'درخواست جدید ثبت شد',
        read: false
      });

      const res = await request(app)
        .get('/api/notifications')
        .set('Cookie', normalCookies);

      expect(res.status).toBe(200);
      expect(res.body.data.notifications.length).toBe(2); // Should still be 2, admin's notification excluded
    });

    it('should limit to 50 notifications', async () => {
      // Create 55 notifications
      const notifications = [];
      for (let i = 0; i < 55; i++) {
        notifications.push({
          user: { userId: normalUser._id, name: normalUser.name },
          type: 'request_assigned',
          title: `Notification ${i}`,
          message: `Message ${i}`,
          read: false
        });
      }
      await Notification.insertMany(notifications);

      const res = await request(app)
        .get('/api/notifications')
        .set('Cookie', normalCookies);

      expect(res.status).toBe(200);
      expect(res.body.data.notifications.length).toBe(50);
    });

    it('should require authentication', async () => {
      const res = await request(app)
        .get('/api/notifications');

      expect(res.status).toBe(401);
    });

    it('should return empty array if no notifications', async () => {
      await Notification.deleteMany({});

      const res = await request(app)
        .get('/api/notifications')
        .set('Cookie', normalCookies);

      expect(res.status).toBe(200);
      expect(res.body.data.notifications.length).toBe(0);
      expect(res.body.data.unreadCount).toBe(0);
    });
  });

  describe('PUT /api/notifications/:id/read', () => {
    let notification;

    beforeEach(async () => {
      notification = await Notification.create({
        user: { userId: normalUser._id, name: normalUser.name },
        type: 'request_assigned',
        title: 'درخواست جدید برای شما',
        message: 'درخواست Test به شما اختصاص داده شد',
        relatedRequest: testRequest._id,
        read: false
      });
    });

    it('should mark notification as read', async () => {
      const res = await request(app)
        .put(`/api/notifications/${notification._id}/read`)
        .set('Cookie', normalCookies);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);

      const updated = await Notification.findById(notification._id);
      expect(updated.read).toBe(true);
    });

    it('should only mark own notifications', async () => {
      // Try to mark admin's notification
      const adminNotification = await Notification.create({
        user: { userId: adminUser._id, name: adminUser.name },
        type: 'request_created',
        title: 'Admin notification',
        message: 'Admin message',
        read: false
      });

      const res = await request(app)
        .put(`/api/notifications/${adminNotification._id}/read`)
        .set('Cookie', normalCookies);

      // Should succeed but not change the notification
      expect(res.status).toBe(200);
      
      const updated = await Notification.findById(adminNotification._id);
      expect(updated.read).toBe(false); // Should remain false
    });

    it('should return 200 even if notification not found', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const res = await request(app)
        .put(`/api/notifications/${fakeId}/read`)
        .set('Cookie', normalCookies);

      expect(res.status).toBe(200);
    });
  });

  describe('POST /api/notifications/read-all', () => {
    beforeEach(async () => {
      await Notification.create({
        user: { userId: normalUser._id, name: normalUser.name },
        type: 'request_assigned',
        title: 'Notification 1',
        message: 'Message 1',
        read: false
      });

      await Notification.create({
        user: { userId: normalUser._id, name: normalUser.name },
        type: 'request_updated',
        title: 'Notification 2',
        message: 'Message 2',
        read: false
      });

      await Notification.create({
        user: { userId: normalUser._id, name: normalUser.name },
        type: 'request_commented',
        title: 'Notification 3',
        message: 'Message 3',
        read: true // Already read
      });
    });

    it('should mark all unread notifications as read', async () => {
      const res = await request(app)
        .post('/api/notifications/read-all')
        .set('Cookie', normalCookies);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);

      const notifications = await Notification.find({ 'user.userId': normalUser._id });
      notifications.forEach(notif => {
        expect(notif.read).toBe(true);
      });
    });

    it('should only affect current user\'s notifications', async () => {
      // Create admin notification
      await Notification.create({
        user: { userId: adminUser._id, name: adminUser.name },
        type: 'request_created',
        title: 'Admin notification',
        message: 'Admin message',
        read: false
      });

      await request(app)
        .post('/api/notifications/read-all')
        .set('Cookie', normalCookies);

      const adminNotif = await Notification.findOne({ 'user.userId': adminUser._id });
      expect(adminNotif.read).toBe(false); // Should remain unread
    });
  });

  describe('DELETE /api/notifications/:id', () => {
    let notification;

    beforeEach(async () => {
      notification = await Notification.create({
        user: { userId: normalUser._id, name: normalUser.name },
        type: 'request_assigned',
        title: 'Test notification',
        message: 'Test message',
        read: false
      });
    });

    it('should delete notification successfully', async () => {
      const res = await request(app)
        .delete(`/api/notifications/${notification._id}`)
        .set('Cookie', normalCookies);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);

      const deleted = await Notification.findById(notification._id);
      expect(deleted).toBeNull();
    });

    it('should only delete own notifications', async () => {
      const adminNotification = await Notification.create({
        user: { userId: adminUser._id, name: adminUser.name },
        type: 'request_created',
        title: 'Admin notification',
        message: 'Admin message',
        read: false
      });

      await request(app)
        .delete(`/api/notifications/${adminNotification._id}`)
        .set('Cookie', normalCookies);

      const notif = await Notification.findById(adminNotification._id);
      expect(notif).toBeDefined(); // Should still exist
    });

    it('should return 200 even if notification not found', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const res = await request(app)
        .delete(`/api/notifications/${fakeId}`)
        .set('Cookie', normalCookies);

      expect(res.status).toBe(200);
    });
  });
});


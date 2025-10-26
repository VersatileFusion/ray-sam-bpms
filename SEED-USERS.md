# Seed Users Documentation

## 🔒 Security Best Practices

All user credentials are stored in `users-data.json` to keep them out of the main codebase. This file contains:
- Admin credentials
- Regular user credentials  
- Customer credentials

## 🚀 How to Seed Users

### First Time Setup

1. **Start the database** (if not running):
   ```bash
   # If using MongoDB Atlas, make sure it's configured in atlas.env
   # If using local MongoDB, make sure it's running
   ```

2. **Seed the database with users**:
   ```bash
   npm run seed
   ```

   OR directly:
   ```bash
   node seed-users.js
   ```

3. **Start the server**:
   ```bash
   npm start
   ```

## 📋 What Gets Created

The seed script will create:
- **1 Admin user** - Full system access
- **5 Regular users** - Standard request management
- **50 Customer users** - Can submit requests with auto-filled information

## 🔄 Re-seeding

The script is **safe to run multiple times**. It will:
- ✅ Create new users if they don't exist
- ⏭️ Skip existing users (won't overwrite or duplicate)

## 🎯 Admin Access

After seeding, you can log in as admin:
- **Username**: `admin`
- **Password**: Check `users-data.json` for the current password
- **Role**: Administrator

## 📝 Editing Credentials

To change user credentials:
1. Edit `users-data.json`
2. Run the seed script again: `npm run seed`
3. The script will update existing users if needed

## ⚠️ Important Notes

- **NEVER commit `users-data.json` to public repositories**
- Keep `users-data.json` secure and restricted
- Use environment variables for production deployments
- Change all default passwords before going live

## 🗑️ Clearing the Database

To reset all users:
```bash
# Connect to MongoDB and clear users collection
# Or use MongoDB Compass / CLI
db.users.deleteMany({})
```

Then re-run: `npm run seed`


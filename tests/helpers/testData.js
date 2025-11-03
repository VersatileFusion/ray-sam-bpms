const usersData = require('../../users-data.json');

module.exports = {
  admin: usersData.admin,
  users: usersData.users,
  customers: usersData.customers,
  
  // Helper to get a random user of a specific role
  getRandomUser: (role = 'user') => {
    const usersByRole = usersData.users.filter(u => u.role === role);
    return usersByRole[Math.floor(Math.random() * usersByRole.length)];
  },
  
  // Helper to get a random customer
  getRandomCustomer: () => {
    return usersData.customers[Math.floor(Math.random() * usersData.customers.length)];
  },
  
  // Get specific user by index
  getUser: (index = 0) => usersData.users[index],
  getCustomer: (index = 0) => usersData.customers[index]
};


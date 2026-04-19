require('dotenv').config({ path: './server/.env' });
const mongoose = require('mongoose');
const User = require('./server/models/Users');

async function checkAccount() {
  await mongoose.connect(process.env.DATABASE_URI);
  console.log('Connected to DB');

  let testUser = await User.findOne({ email: 'testing@test.com' });
  if (testUser) {
    console.log('User testing@test.com exists. ID:', testUser._id);
    // Let's reset the password to testing123
    testUser.password = 'testing123';
    await testUser.save();
    console.log('Password reset to testing123');
  } else {
    console.log('User testing@test.com NOT FOUND. Creating...');
    testUser = await User.create({
      name: 'Testing Account',
      email: 'testing@test.com',
      password: 'testing123',
      role: 'Developer'
    });
    console.log('Created testing@test.com with testing123');
  }
  
  const allUsers = await User.find({}, 'email name role');
  console.log('\nAll users in DB:');
  console.table(allUsers.map(u => ({ email: u.email, name: u.name, role: u.role })));

  await mongoose.disconnect();
}

checkAccount().catch(console.error);

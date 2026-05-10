const mongoose = require('mongoose');
const request = require('supertest');
const app = require('./server'); // Assuming app is exported from server.js
const User = require('./models/Users');
const jwt = require('jsonwebtoken');

require('dotenv').config();

async function runTest() {
    console.log("Connecting to DB...");
    await mongoose.connect(process.env.DATABASE_URI);
    
    console.log("Creating mock Japanese Client user...");
    const email = 'test_client_permissions@example.com';
    await User.deleteOne({ email });
    const user = await User.create({
        name: 'Client Test',
        email,
        password: 'password123',
        role: 'Japanese client',
        preferredLanguage: 'ja'
    });

    const token = jwt.sign({ id: user._id, role: user.role }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1h' });

    console.log("Testing POST /api/projects (should be 403 FORBIDDEN)");
    const projRes = await request(app)
        .post('/api/projects')
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'Test Project', description: 'Test' });
    
    console.log(`Status: ${projRes.status} (Expected 403)`);
    
    console.log("Testing POST /api/tasks (should be 403 FORBIDDEN)");
    const taskRes = await request(app)
        .post('/api/tasks')
        .set('Authorization', `Bearer ${token}`)
        .send({ title: 'Test Task' });
        
    console.log(`Status: ${taskRes.status} (Expected 403)`);

    console.log("Cleaning up...");
    await User.deleteOne({ email });
    await mongoose.disconnect();
    
    if (projRes.status === 403 && taskRes.status === 403) {
        console.log("SUCCESS: Permissions correctly restrict Japanese Client.");
    } else {
        console.log("FAILED");
    }
}

runTest().catch(console.error);

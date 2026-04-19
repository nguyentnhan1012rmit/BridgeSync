require('dotenv').config({ path: '.env' });
const mongoose = require('mongoose');

const User = require('./models/Users');
const Project = require('./models/Projects');
const Task = require('./models/Tasks');
const Hourenso = require('./models/HourensoReports');
const ITGlossary = require('./models/ITGlossary');


async function seedData() {
  await mongoose.connect(process.env.DATABASE_URI);
  console.log('Connected to BD for seeding');
  
  const testUser = await User.findOne({ email: 'testing@test.com' });
  if (!testUser) {
    console.log('Please register testing@test.com first');
    process.exit(1);
  }
  
  console.log('User found! Creating mock data...');
  
  // Create 3 Projects
  const project1 = await Project.create({ name: 'Alpha Migration', description: 'Migrate legacy infrastructure to AWS', status: 'active', members: [testUser._id] });
  const project2 = await Project.create({ name: 'Beta Launch', description: 'Prepare for Q3 release', status: 'active', members: [testUser._id] });
  const project3 = await Project.create({ name: 'Archive Zeta', description: 'Internal tool deprecation', status: 'archived', members: [testUser._id] });
  
  console.log('Projects created.');
  
  // Create Tasks for Project 1
  await Task.create({ projectId: project1._id, title: 'Setup VPC', description: 'Configure AWS VPC for the new environment', status: 'ongoing', assigneeId: testUser._id, reporterId: testUser._id });
  await Task.create({ projectId: project1._id, title: 'Database Migration', description: 'Move MongoDB data to RDS', status: 'delayed', assigneeId: testUser._id, reporterId: testUser._id });
  
  // Create Tasks for Project 2
  await Task.create({ projectId: project2._id, title: 'Design Final Review', description: 'Review UI mockups', status: 'completed', assigneeId: testUser._id, reporterId: testUser._id });
  await Task.create({ projectId: project2._id, title: 'QA Testing Phase 1', description: 'Initial bug sweeps', status: 'ongoing', assigneeId: testUser._id, reporterId: testUser._id });
  
  console.log('Tasks created.');
  
  // Create Hourenso Reports
  await Hourenso.create({
    projectId: project1._id,
    authorId: testUser._id,
    houkoku: {
      currentStatus: 'Currently configuring AWS environments.',
      progress: 'VPC is 50% done, RDS pending.',
      issues: 'AWS console is slow today.',
      nextSteps: 'Finish VPC layout.'
    },
    renraku: {
      sharedInformation: 'The new AWS keys have been distributed via LastPass.'
    },
    soudan: {
      topic: 'RDS Instance Size',
      proposedOptions: ['t3.medium', 't3.large'],
      deadline: new Date(Date.now() + 86400000)
    }
  });

  await Hourenso.create({
    projectId: project2._id,
    authorId: testUser._id,
    houkoku: {
      currentStatus: 'QA is halfway done.',
      progress: 'Completed core flows.',
      issues: 'Found a styling bug in Safari.',
      nextSteps: 'Fix Safari bug and retest.'
    }
  });
  
  console.log('Hourenso reports created.');
  
  // Check glossary
  const gloss = await ITGlossary.findOne({ baseTerm: 'API' });
  if (!gloss) {
    await ITGlossary.create({
      baseTerm: 'API',
      translations: { en: 'Application Programming Interface', vi: 'Giao diện lập trình ứng dụng', ja: 'アプリケーションプログラミングインターフェース' },
      addedBy: testUser._id,
      useCount: 15
    });
    console.log('Glossary seeded.');
  }

  console.log('Data seeding completed fully!');
  await mongoose.disconnect();
}

seedData().catch(console.error);

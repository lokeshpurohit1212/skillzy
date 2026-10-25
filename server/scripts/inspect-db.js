const mongoose = require('mongoose');
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const connectDB = require('../config/db');
const User = require('../models/User');
const Community = require('../models/Community');
const Event = require('../models/Event');
const Swap = require('../models/Swap');
const Message = require('../models/Message');

async function inspect() {
  await connectDB();
  const totalUsers = await User.countDocuments();
  const allUsers = await User.find({}, 'name email location profilePhoto skillsOffered skillsWanted xp level streak').lean();
  
  const demoUsers = allUsers.filter(u => u.email.endsWith('@example.com'));
  const realUsers = allUsers.filter(u => !u.email.endsWith('@example.com'));

  console.log('=== DATABASE INSPECTION ===');
  console.log(`Total Users in DB: ${totalUsers}`);
  console.log(`Demo Users (@example.com): ${demoUsers.length}`);
  demoUsers.forEach((u, i) => {
    console.log(`  ${i + 1}. ${u.name} | ${u.email} | ${u.location} | Photo: ${u.profilePhoto?.substring(0, 35)}...`);
  });

  console.log(`\nReal Users: ${realUsers.length}`);
  realUsers.forEach((u, i) => {
    console.log(`  ${i + 1}. ${u.name} | ${u.email} | ${u.location} | Photo: ${u.profilePhoto?.substring(0, 35)}...`);
  });

  const communities = await Community.find({}, 'name slug category members').lean();
  console.log(`\nCommunities: ${communities.length}`);
  communities.forEach((c, i) => {
    console.log(`  ${i + 1}. ${c.name} (${c.category}) - ${c.members?.length || 0} members`);
  });

  const events = await Event.countDocuments();
  const swaps = await Swap.countDocuments();
  const messages = await Message.countDocuments();
  console.log(`\nEvents: ${events}`);
  console.log(`Swaps: ${swaps}`);
  console.log(`Messages: ${messages}`);

  process.exit(0);
}

inspect().catch(err => {
  console.error('Inspection error:', err);
  process.exit(1);
});

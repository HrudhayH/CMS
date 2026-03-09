const mongoose = require('mongoose');
const path = require('path');
const fs = require('fs');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const Admin = require('./models/Admin');
const Staff = require('./models/Staff');
const Client = require('./models/Client');
const Project = require('./models/Project');

async function run() {
  await mongoose.connect(process.env.MONGO_URI);
  const data = {
    admins: await Admin.find({}, 'email role'),
    staff: await Staff.find({}, 'name email'),
    clients: await Client.find({}, 'name email company'),
    projects: await Project.find({}, 'title projectCode status staff client')
  };
  fs.writeFileSync('audit_results.json', JSON.stringify(data, null, 2));
  console.log('Data written to audit_results.json');
  process.exit(0);
}

run();

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const mongoose = require('mongoose');
const Project = require('./models/Project');
const Staff = require('./models/Staff');

const assignProjectToStaff = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB connected');

    // Get the first project
    const project = await Project.findOne().sort({ createdAt: -1 });
    if (!project) {
      console.log('No projects found');
      process.exit(1);
    }

    // Get the first staff member
    const staff = await Staff.findOne();
    if (!staff) {
      console.log('No staff members found');
      process.exit(1);
    }

    // Assign project to staff if not already assigned
    if (!project.assignedStaff.includes(staff._id)) {
      project.assignedStaff.push(staff._id);
      await project.save();
      console.log(`✅ Assigned project "${project.title}" to staff "${staff.email}"`);
    } else {
      console.log(`✅ Project "${project.title}" is already assigned to staff "${staff.email}"`);
    }

    console.log('\nProject ID:', project._id);
    console.log('Staff Email:', staff.email);

    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
};

assignProjectToStaff();

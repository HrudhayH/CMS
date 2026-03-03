const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const mongoose = require('mongoose');
const Project = require('./models/Project');
const Roadmap = require('./models/Roadmap');
const Staff = require('./models/Staff');

const verifyRoadmapIntegration = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ MongoDB connected');

    // Find the project with roadmap
    const project = await Project.findOne().sort({ createdAt: -1 });
    if (!project) {
      console.log('❌ No projects found');
      process.exit(1);
    }

    console.log('\n📋 Project Details:');
    console.log('ID:', project._id);
    console.log('Title:', project.title);
    console.log('Status:', project.status);

    // Find roadmap for this project
    const roadmap = await Roadmap.findOne({ project: project._id });
    if (!roadmap) {
      console.log('\n❌ No roadmap found for this project');
      process.exit(1);
    }

    console.log('\n🗺️ Roadmap Details:');
    console.log('Total Phases:', roadmap.phases.length);
    console.log('Overall Progress:', roadmap.overallProgress, '%');
    console.log('Status:', roadmap.status);
    console.log('Deadline:', roadmap.deadline);

    console.log('\n📊 Phases:');
    roadmap.phases.forEach((phase, index) => {
      console.log(`\n${index + 1}. ${phase.name}`);
      console.log('   Status:', phase.status);
      console.log('   Progress:', phase.progress, '%');
      console.log('   Start:', phase.startDate?.toISOString().split('T')[0]);
      console.log('   End:', phase.endDate?.toISOString().split('T')[0]);
      console.log(`   Milestones: ${phase.milestones.length}`);
      phase.milestones.forEach((m, idx) => {
        console.log(`     ${idx + 1}. ${m.title} (${m.status})`);
      });
    });

    // Check for staff
    const staffCount = await Staff.countDocuments();
    console.log('\n👥 Staff Users:', staffCount);

    if (staffCount > 0) {
      const staff = await Staff.findOne();
      console.log('Sample Staff:', staff.email);
    }

    console.log('\n✅ Verification Complete!');
    console.log('\n🚀 API Endpoints:');
    console.log(`GET  /staff/projects/${project._id}/roadmap`);
    console.log(`POST /staff/projects/${project._id}/roadmap`);
    console.log(`POST /staff/projects/${project._id}/roadmap/phases`);
    console.log(`PUT  /staff/projects/${project._id}/roadmap/phases/:phaseId`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
};

verifyRoadmapIntegration();

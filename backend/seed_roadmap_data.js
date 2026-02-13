const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const mongoose = require('mongoose');
const Project = require('./models/Project');
const Roadmap = require('./models/Roadmap');

const seedRoadmapData = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB connected');

    // Get the first project or create one if it doesn't exist
    let project = await Project.findOne();
    
    if (!project) {
      console.log('No projects found. Creating a test project...');
      project = await Project.create({
        title: 'Website Redesign & Migration',
        description: 'Complete redesign and migration of the company website to a modern platform',
        status: 'In Progress',
        startDate: new Date('2024-09-01'),
        endDate: new Date('2024-12-15'),
        techStack: ['React', 'Node.js', 'MongoDB'],
        progress: 65
      });
      console.log('Test project created:', project._id);
    } else {
      console.log('Using existing project:', project._id, '-', project.title);
    }

    // Check if roadmap already exists for this project
    let roadmap = await Roadmap.findOne({ project: project._id });
    
    if (roadmap) {
      console.log('Roadmap already exists for this project. Deleting and recreating...');
      await Roadmap.deleteOne({ project: project._id });
    }

    // Create new roadmap with 2 phases
    roadmap = new Roadmap({
      project: project._id,
      phases: [
        {
          name: 'Phase 1: Discovery & Research',
          startDate: new Date('2024-09-01'),
          endDate: new Date('2024-09-15'),
          status: 'Completed',
          progress: 100,
          latestComment: 'All stakeholder interviews completed and requirements documented.',
          milestones: [
            {
              title: 'Stakeholder Interviews',
              status: 'Completed',
              dueDate: new Date('2024-09-05')
            },
            {
              title: 'Competitor Analysis',
              status: 'Completed',
              dueDate: new Date('2024-09-10')
            },
            {
              title: 'Final Requirements Document',
              status: 'Completed',
              dueDate: new Date('2024-09-15')
            }
          ]
        },
        {
          name: 'Phase 2: UI/UX Design',
          startDate: new Date('2024-09-16'),
          endDate: new Date('2024-10-15'),
          status: 'In Progress',
          progress: 75,
          latestComment: 'High-fidelity mockups currently under review with stakeholders.',
          milestones: [
            {
              title: 'Wireframes',
              status: 'Completed',
              dueDate: new Date('2024-09-25')
            },
            {
              title: 'High-Fidelity Mockups',
              status: 'In Progress',
              dueDate: new Date('2024-10-05')
            },
            {
              title: 'Design System & Guidelines',
              status: 'In Progress',
              dueDate: new Date('2024-10-10')
            },
            {
              title: 'Design Sign-off',
              status: 'Not Started',
              dueDate: new Date('2024-10-15')
            }
          ]
        }
      ]
    });

    await roadmap.save();
    console.log('✅ Roadmap seeded successfully!');
    console.log('');
    console.log('📊 Roadmap Details:');
    console.log('Project ID:', project._id);
    console.log('Project:', project.title);
    console.log('');
    console.log('Phases Created:');
    console.log('1. Phase 1: Discovery & Research (Completed - 100%)');
    console.log('   - 3 Milestones');
    console.log('2. Phase 2: UI/UX Design (In Progress - 75%)');
    console.log('   - 4 Milestones');
    console.log('');

    process.exit(0);
  } catch (error) {
    console.error('Error seeding roadmap data:', error.message);
    process.exit(1);
  }
};

seedRoadmapData();

const mongoose = require('mongoose');
const Roadmap = require('./models/Roadmap');
const Project = require('./models/Project');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const seedRoadmap = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');

        // Find a project to attach the roadmap to
        // You can hardcode an ID if needed, or find the most recent one
        const project = await Project.findOne().sort({ createdAt: -1 });

        if (!project) {
            console.log('No projects found to attach roadmap to.');
            process.exit(1);
        }

        console.log(`Seeding roadmap for project: ${project.title} (${project._id})`);

        // Check if roadmap exists, delete it if so to ensure fresh start for testing
        await Roadmap.deleteMany({ project: project._id });

        const roadmap = new Roadmap({
            project: project._id,
            phases: []
        });

        await roadmap.save();
        console.log('Roadmap seeded successfully!');
        process.exit(0);
    } catch (error) {
        console.error('Error seeding roadmap:', error);
        process.exit(1);
    }
};

seedRoadmap();

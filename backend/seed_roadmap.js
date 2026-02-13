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
            phases: [
                {
                    name: "Phase 1: Foundation Setup",
                    startDate: new Date("2024-03-01"),
                    endDate: new Date("2024-03-15"),
                    status: "Completed",
                    progress: 100,
                    latestComment: "Initial setup completed ahead of schedule.",
                    milestones: [
                        { title: "Database Schema Design", status: "Completed", dueDate: new Date("2024-03-05") },
                        { title: "API Configuration", status: "Completed", dueDate: new Date("2024-03-10") },
                        { title: "Authentication System", status: "Completed", dueDate: new Date("2024-03-14") }
                    ]
                },
                {
                    name: "Phase 2: Core Features Implementation",
                    startDate: new Date("2024-03-16"),
                    endDate: new Date("2024-04-15"),
                    status: "In Progress",
                    progress: 45,
                    latestComment: "Currently working on the user dashboard components.",
                    milestones: [
                        { title: "User Dashboard", status: "In Progress", dueDate: new Date("2024-03-25") },
                        { title: "Reporting Module", status: "Not Started", dueDate: new Date("2024-04-05") },
                        { title: "Notification System", status: "Not Started", dueDate: new Date("2024-04-12") }
                    ]
                }
            ]
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

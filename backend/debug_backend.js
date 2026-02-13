const mongoose = require('mongoose');
const Client = require('./models/Client');
const Project = require('./models/Project');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const debugClientProjects = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB connected');

        const clients = await Client.find().lean();
        console.log(`Found ${clients.length} clients`);

        const clientIds = clients.map(c => c._id);
        const projects = await Project.find({
            assignedClients: { $in: clientIds }
        }).lean();
        console.log(`Found ${projects.length} projects for these clients`);

        const clientsWithProjects = clients.map(client => {
            const clientProjects = projects.filter(project =>
                project.assignedClients.some(id => id.toString() === client._id.toString())
            );
            return {
                name: client.name,
                projectCount: clientProjects.length,
                projectNames: clientProjects.map(p => p.title)
            };
        });

        console.log('Clients with Projects:', JSON.stringify(clientsWithProjects, null, 2));
        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
};

debugClientProjects();

/**
 * API Integration Test Script
 * Tests the Roadmap APIs with real data
 */
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const Project = require('./models/Project');
const Staff = require('./models/Staff');

const API_URL = 'http://localhost:5001';

const testRoadmapAPI = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ MongoDB connected\n');

    // Get a staff member for authentication
    const staff = await Staff.findOne();
    if (!staff) {
      console.log('❌ No staff members found for testing');
      process.exit(1);
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: staff._id, role: 'staff' },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    console.log('🔐 Using Staff:', staff.email);

    // Get a project with roadmap
    const project = await Project.findOne().sort({ createdAt: -1 });
    const projectId = project._id;

    console.log('📋 Using Project:', project.title, '(' + projectId + ')\n');

    // Test 1: Get Roadmap
    console.log('🧪 Test 1: GET /staff/projects/:id/roadmap');
    try {
      const res = await fetch(`${API_URL}/staff/projects/${projectId}/roadmap`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      const data = await res.json();
      if (res.ok && data) {
        console.log('✅ PASSED - Roadmap fetched');
        console.log(`   Phases: ${data.phases.length}`);
        console.log(`   Overall Progress: ${data.overallProgress}%`);
      } else {
        console.log('❌ FAILED -', data.message || res.status);
      }
    } catch (err) {
      console.log('❌ ERROR:', err.message);
    }

    // Test 2: Update a Phase
    console.log('\n🧪 Test 2: PUT /staff/projects/:id/roadmap/phases/:phaseId');
    try {
      const roadmap = await fetch(`${API_URL}/staff/projects/${projectId}/roadmap`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }).then(r => r.json());

      if (!roadmap || !roadmap.phases || roadmap.phases.length === 0) {
        console.log('❌ FAILED - No phases available');
      } else {
        const phaseId = roadmap.phases[0]._id;
        const updateData = {
          progress: Math.min(100, roadmap.phases[0].progress + 10),
          latestComment: 'Updated via API test - ' + new Date().toISOString()
        };

        const res = await fetch(
          `${API_URL}/staff/projects/${projectId}/roadmap/phases/${phaseId}`,
          {
            method: 'PUT',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(updateData)
          }
        );

        const data = await res.json();
        if (res.ok && data) {
          const updatedPhase = data.phases.find(p => p._id.toString() === phaseId.toString());
          console.log('✅ PASSED - Phase updated');
          console.log(`   New Progress: ${updatedPhase.progress}%`);
        } else {
          console.log('❌ FAILED -', data.message || res.status);
        }
      }
    } catch (err) {
      console.log('❌ ERROR:', err.message);
    }

    // Test 3: Add a Milestone
    console.log('\n🧪 Test 3: POST /staff/projects/:id/roadmap/phases/:phaseId/milestones');
    try {
      const roadmap = await fetch(`${API_URL}/staff/projects/${projectId}/roadmap`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }).then(r => r.json());

      if (!roadmap || !roadmap.phases || roadmap.phases.length === 0) {
        console.log('❌ FAILED - No phases available');
      } else {
        const phaseId = roadmap.phases[0]._id;
        const milestoneData = {
          title: 'Test Milestone - ' + new Date().getTime(),
          status: 'Not Started',
          dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
        };

        const res = await fetch(
          `${API_URL}/staff/projects/${projectId}/roadmap/phases/${phaseId}/milestones`,
          {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(milestoneData)
          }
        );

        const data = await res.json();
        if (res.ok && data) {
          const updatedPhase = data.phases.find(p => p._id.toString() === phaseId.toString());
          console.log('✅ PASSED - Milestone added');
          console.log(`   Phase now has ${updatedPhase.milestones.length} milestones`);
        } else {
          console.log('❌ FAILED -', data.message || res.status);
        }
      }
    } catch (err) {
      console.log('❌ ERROR:', err.message);
    }

    console.log('\n✅ All tests completed!\n');
    process.exit(0);
  } catch (error) {
    console.error('❌ Test Error:', error.message);
    process.exit(1);
  }
};

testRoadmapAPI();

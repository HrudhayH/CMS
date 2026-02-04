const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const Staff = require('./models/Staff');

async function verifyStaff() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');

        // 1. Test Default Status
        console.log('\n--- Testing Default Status ---');
        const newStaff = await Staff.create({
            name: 'Test Staff ' + Date.now(),
            email: 'test' + Date.now() + '@example.com',
            phone: '1234567890',
            password: 'password123'
        });
        console.log('Staff created with ID:', newStaff._id);
        console.log('Default status:', newStaff.status);

        if (newStaff.status === 'Active') {
            console.log('SUCCESS: Default status is Active.');
        } else {
            console.log('FAILURE: Default status is NOT Active.');
        }

        // 2. Test Phone Persistence
        console.log('\n--- Testing Phone Persistence ---');
        if (newStaff.phone === '1234567890') {
            console.log('SUCCESS: Phone number saved correctly.');
        } else {
            console.log('FAILURE: Phone number NOT saved correctly.');
        }

        // 3. Test Status Update (Valid)
        console.log('\n--- Testing Status Update (Active -> Inactive) ---');
        newStaff.status = 'Inactive';
        await newStaff.save();
        const updatedStaff = await Staff.findById(newStaff._id);
        console.log('Updated status:', updatedStaff.status);

        if (updatedStaff.status === 'Inactive') {
            console.log('SUCCESS: Status updated to Inactive.');
        } else {
            console.log('FAILURE: Status NOT updated correctly.');
        }

        // 4. Test Old Enum (should fail validation if we try to save)
        console.log('\n--- Testing Old Enum (Paused) ---');
        try {
            updatedStaff.status = 'Paused';
            await updatedStaff.save();
            console.log('FAILURE: Paused status was accepted!');
        } catch (err) {
            console.log('SUCCESS: Paused status rejected as expected:', err.message);
        }

        await mongoose.disconnect();
        console.log('\nStaff Verification Complete.');
    } catch (error) {
        console.error('Error during verification:', error);
        process.exit(1);
    }
}

verifyStaff();

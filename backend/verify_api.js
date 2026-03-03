const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const BASE_URL = 'http://localhost:5001';

const verifyApi = async () => {
    try {
        // 1. Login to get token
        console.log(`Logging in to ${BASE_URL}/auth/admin/login ...`);
        const loginRes = await fetch(`${BASE_URL}/auth/admin/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: 'admin@cms.com',
                password: 'admin123'
            })
        });

        if (!loginRes.ok) {
            const errorText = await loginRes.text();
            throw new Error(`Login failed: ${loginRes.status} ${errorText}`);
        }

        const loginData = await loginRes.json();
        const token = loginData.data?.token || loginData.token; // Check both structures
        console.log('Got token:', token ? 'Yes' : 'No');

        if (!token) {
            console.error('Login response:', loginData);
            throw new Error('No token received');
        }

        // 2. Fetch clients
        console.log(`Fetching clients from ${BASE_URL}/admin/clients ...`);
        const clientsRes = await fetch(`${BASE_URL}/admin/clients`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (!clientsRes.ok) {
            const errorText = await clientsRes.text();
            throw new Error(`Fetch clients failed: ${clientsRes.status} ${errorText}`);
        }

        const clientsData = await clientsRes.json();
        const clients = clientsData.data;
        console.log(`Fetched ${clients.length} clients`);

        // 3. Check first client for projects field
        if (clients.length > 0) {
            const client = clients[0];
            console.log('First client:', client.name);
            console.log('Has projects field:', client.projects !== undefined);
            if (client.projects) {
                console.log('Project count:', client.projects.length);
                console.log('Projects:', JSON.stringify(client.projects, null, 2));
            } else {
                console.log('Projects field is MISSING!');
                // Look closely at the keys we DO have
                console.log('Available keys:', Object.keys(client));
            }

            // 4. Test the specific endpoint
            console.log(`Testing detail endpoint ${BASE_URL}/admin/clients/${client._id}/projects ...`);
            const detailRes = await fetch(`${BASE_URL}/admin/clients/${client._id}/projects`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!detailRes.ok) {
                console.error(`Detail fetch failed: ${detailRes.status}`);
            } else {
                const detailData = await detailRes.json();
                console.log('Detail endpoint success:', detailData.success);
                console.log('Detail projects:', detailData.data?.projects?.length);
            }
        }

    } catch (error) {
        console.error('Error:', error.message);
    }
};

verifyApi();

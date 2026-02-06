const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const authRoutes = require('./routes/auth.routes');
const adminRoutes = require('./routes/admin.routes');
const staffPortalRoutes = require('./routes/staffPortal.routes');
const clientPortalRoutes = require('./routes/clientPortal.routes');

const app = express();

app.use(cors());
app.use(express.json());

connectDB();

app.use('/auth', authRoutes);
app.use('/admin', adminRoutes);
app.use('/staff', staffPortalRoutes);
app.use('/client', clientPortalRoutes);

app.get('/', (req, res) => {
  res.json({ message: 'CMS API is running.' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

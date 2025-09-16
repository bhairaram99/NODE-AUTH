const express = require('express');
require('dotenv').config();
const connectDB = require('./database/db');
const authRoutes = require('./routes/auth-routes');
const homeRoutes = require('./routes/home-route');
const admin = require('./routes/admin-routes')
const uploadImageRoutes = require('./routes/image-routes')

const app = express();
const PORT = process.env.PORT || 3000;
connectDB();
// meiddleware for parsing json data
app.use(express.json());
app.use('/api/auth', authRoutes);
app.use('/api/home', homeRoutes);
app.use('/api/admin', admin);
app.use('/api/image', uploadImageRoutes);

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
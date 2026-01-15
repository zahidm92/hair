const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { sequelize } = require('./models');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Sync Database
const startServer = async () => {
    try {
        await sequelize.authenticate();
        console.log('Database connected successfully.');
        // Sync models
        await sequelize.sync({ alter: true });
        app.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
        });
    } catch (error) {
        console.error('Unable to connect to the database:', error);
    }
};

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/services', require('./routes/services'));
app.use('/api/bookings', require('./routes/bookings'));


app.get('/', (req, res) => {
    res.send('Haircut Salon API is running');
});

startServer();

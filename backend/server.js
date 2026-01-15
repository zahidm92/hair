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
const connectWithRetry = async () => {
    const maxRetries = 5;
    let retries = 0;

    while (retries < maxRetries) {
        try {
            await sequelize.authenticate();
            console.log('Database connected successfully.');
            // Sync models
            await sequelize.sync({ alter: true });
            return; // Success
        } catch (error) {
            retries++;
            console.error(`Unable to connect to the database (Attempt ${retries}/${maxRetries}):`, error.message);
            if (retries === maxRetries) {
                console.error('Max retries reached. Exiting...');
                process.exit(1);
            }
            // Wait for 5 seconds before retrying
            await new Promise(resolve => setTimeout(resolve, 5000));
        }
    }
};

const startServer = async () => {
    await connectWithRetry();
    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
};

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/services', require('./routes/services'));
app.use('/api/bookings', require('./routes/bookings'));


app.get('/', (req, res) => {
    res.send('Haircut Salon API is running');
});

startServer();

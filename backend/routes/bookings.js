const express = require('express');
const router = express.Router();
const { Booking, Service } = require('../models');
const { Op } = require('sequelize');

// GET Available Slots for a Date
router.get('/slots', async (req, res) => {
    try {
        const { date } = req.query; // Format: YYYY-MM-DD
        if (!date) return res.status(400).json({ error: 'Date is required' });

        // Define Start and End of the day
        const startOfDay = new Date(`${date}T00:00:00`);
        const endOfDay = new Date(`${date}T23:59:59`);

        // Find existing bookings for that day (exclude Rejected/Cancelled if applicable)
        const bookings = await Booking.findAll({
            where: {
                date: {
                    [Op.between]: [startOfDay, endOfDay]
                },
                status: { [Op.ne]: 'Rejected' }
            }
        });

        // Generate all possible 15-min slots from 09:00 to 18:00
        const slots = [];
        const startTime = 9; // 9 AM
        const endTime = 18;  // 6 PM

        for (let hour = startTime; hour < endTime; hour++) {
            for (let min = 0; min < 60; min += 15) {
                const timeStr = `${hour.toString().padStart(2, '0')}:${min.toString().padStart(2, '0')}`;

                // Check if this slot is already booked
                // Assuming simple logic: if a booking exists at this exact time, it's taken.
                // Improve logic later for duration-based overlap if needed.
                const isBooked = bookings.some(b => {
                    const bDate = new Date(b.date);
                    const bHour = bDate.getHours();
                    const bMin = bDate.getMinutes();
                    return bHour === hour && bMin === min;
                });

                slots.push({
                    time: timeStr,
                    available: !isBooked
                });
            }
        }

        res.json(slots);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});


// CREATE Booking
router.post('/', async (req, res) => {
    try {
        // Validate if service exists
        const service = await Service.findByPk(req.body.ServiceId);
        if (!service) {
            return res.status(404).json({ error: 'Service not found' });
        }

        const booking = await Booking.create(req.body);
        res.status(201).json(booking);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// GET All Bookings (Admin)
router.get('/', async (req, res) => {
    try {
        const bookings = await Booking.findAll({ include: Service, order: [['createdAt', 'DESC']] });
        res.json(bookings);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// UPDATE Booking Status
router.patch('/:id/status', async (req, res) => {
    try {
        const { status, suggestedDate, adminNotes } = req.body;
        const booking = await Booking.findByPk(req.params.id);

        if (!booking) {
            return res.status(404).json({ message: 'Booking not found' });
        }

        // Update fields
        if (status) booking.status = status;
        if (suggestedDate) booking.suggestedDate = suggestedDate;
        if (adminNotes) booking.adminNotes = adminNotes;

        await booking.save();
        res.json(booking);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

module.exports = router;

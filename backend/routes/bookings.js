const express = require('express');
const router = express.Router();
const { Booking, Service } = require('../models');


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

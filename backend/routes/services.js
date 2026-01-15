const express = require('express');
const router = express.Router();
const { Service } = require('../models');


// GET all services
router.get('/', async (req, res) => {
    try {
        const services = await Service.findAll();
        res.json(services);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// POST new service (Admin)
router.post('/', async (req, res) => {
    try {
        const service = await Service.create(req.body);
        res.status(201).json(service);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// DELETE service
router.delete('/:id', async (req, res) => {
    try {
        const result = await Service.destroy({ where: { id: req.params.id } });
        if (result) {
            res.json({ message: 'Service deleted' });
        } else {
            res.status(404).json({ message: 'Service not found' });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;

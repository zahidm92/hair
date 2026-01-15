import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import api from '../api/axios';

const Book = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const preSelectedService = location.state?.service;

    const [services, setServices] = useState([]);
    const [formData, setFormData] = useState({
        customerName: '',
        phoneNumber: '',
        date: '',
        ServiceId: preSelectedService?.id || '',
    });
    const [status, setStatus] = useState({ type: '', message: '' });

    useEffect(() => {
        if (!preSelectedService) {
            // Fetch services if not pre-selected to populate dropdown
            api.get('/services').then(res => setServices(res.data)).catch(console.error);
        }
    }, [preSelectedService]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validation: 15-min slots & Business Hours (09:00 - 18:00)
        const dateObj = new Date(formData.date);
        const hours = dateObj.getHours();
        const minutes = dateObj.getMinutes();

        if (hours < 9 || hours >= 18) {
            setStatus({ type: 'error', message: 'Bookings are only available between 09:00 and 18:00.' });
            return;
        }

        if (minutes % 15 !== 0) {
            setStatus({ type: 'error', message: 'Please select a time slot in 15-minute intervals (e.g., 09:00, 09:15, 09:30).' });
            return;
        }

        setStatus({ type: 'loading', message: 'Submitting booking...' });

        try {
            await api.post('/bookings', formData);
            setStatus({ type: 'success', message: 'Booking request submitted successfully! We will contact you shortly.' });
            setTimeout(() => navigate('/'), 3000);
        } catch (err) {
            setStatus({ type: 'error', message: err.response?.data?.error || 'Failed to submit booking.' });
        }
    };

    return (
        <div className="max-w-lg mx-auto bg-white p-8 rounded-lg shadow-md">
            <h2 className="text-2xl font-bold mb-6 text-center">Book an Appointment</h2>

            {status.message && (
                <div className={`p-4 mb-4 rounded ${status.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {status.message}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-gray-700 mb-1">Select Service</label>
                    {preSelectedService ? (
                        <div className="p-3 bg-gray-100 rounded border border-gray-300">
                            {preSelectedService.title} - ${preSelectedService.price}
                            <input type="hidden" name="ServiceId" value={preSelectedService.id} />
                        </div>
                    ) : (
                        <select
                            name="ServiceId"
                            value={formData.ServiceId}
                            onChange={handleChange}
                            className="w-full p-2 border rounded focus:ring-2 focus:ring-primary outline-none"
                            required
                        >
                            <option value="">-- Choose a Service --</option>
                            {services.map(s => (
                                <option key={s.id} value={s.id}>{s.title} - ${s.price}</option>
                            ))}
                        </select>
                    )}
                </div>

                <div>
                    <label className="block text-gray-700 mb-1">Your Name</label>
                    <input
                        type="text"
                        name="customerName"
                        value={formData.customerName}
                        onChange={handleChange}
                        className="w-full p-2 border rounded focus:ring-2 focus:ring-primary outline-none"
                        required
                        placeholder="John Doe"
                    />
                </div>

                <div>
                    <label className="block text-gray-700 mb-1">Phone Number</label>
                    <input
                        type="tel"
                        name="phoneNumber"
                        value={formData.phoneNumber}
                        onChange={handleChange}
                        className="w-full p-2 border rounded focus:ring-2 focus:ring-primary outline-none"
                        required
                        placeholder="+1 234 567 8900"
                    />
                </div>

                <div>
                    <label className="block text-gray-700 mb-1">Preferred Date & Time</label>
                    <input
                        type="datetime-local"
                        name="date"
                        value={formData.date}
                        onChange={handleChange}
                        className="w-full p-2 border rounded focus:ring-2 focus:ring-primary outline-none"
                        required
                    />
                    <p className="text-xs text-gray-500 mt-1">Open 09:00 - 18:00. Please select 15-minute intervals.</p>
                </div>

                <button
                    type="submit"
                    disabled={status.type === 'loading'}
                    className="w-full bg-primary text-white py-3 rounded font-semibold hover:bg-gray-800 transition disabled:opacity-50"
                >
                    {status.type === 'loading' ? 'Processing...' : 'Confirm Booking'}
                </button>
            </form>
        </div>
    );
};

export default Book;

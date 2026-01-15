import React, { useEffect, useState } from 'react';
import api from '../api/axios';
import { useNavigate } from 'react-router-dom';
import { Check, X, Calendar, Eye } from 'lucide-react';

const AdminDashboard = () => {
    const [bookings, setBookings] = useState([]);
    const [services, setServices] = useState([]);
    const [users, setUsers] = useState([]);
    const [view, setView] = useState('bookings'); // 'bookings', 'services', 'users'
    const [role, setRole] = useState('');
    const [username, setUsername] = useState('');
    const navigate = useNavigate();

    // New Service Form State
    const [newService, setNewService] = useState({ title: '', price: '', duration: '', description: '', imageURL: '' });

    // New User Form State
    const [newUser, setNewUser] = useState({ username: '', password: '', role: 'admin' });

    useEffect(() => {
        const storedRole = localStorage.getItem('role');
        const storedUser = localStorage.getItem('username');
        if (!storedRole) navigate('/login');
        setRole(storedRole);
        setUsername(storedUser);
        fetchData(storedRole);
    }, [navigate]);

    const fetchData = async (currentRole) => {
        try {
            const roleToCheck = currentRole || localStorage.getItem('role');
            const promises = [
                api.get('/bookings'),
                api.get('/services')
            ];

            if (roleToCheck === 'root') {
                promises.push(api.get('/auth/users'));
            }

            const results = await Promise.all(promises);
            setBookings(results[0].data);
            setServices(results[1].data);
            if (results[2]) setUsers(results[2].data);
        } catch (error) {
            console.error("Error fetching data", error);
        }
    };

    const handleLogout = () => {
        localStorage.clear();
        navigate('/');
    };

    const updateStatus = async (id, status) => {
        try {
            await api.patch(`/bookings/${id}/status`, { status });
            fetchData();
        } catch (error) {
            alert("Failed to update status");
        }
    };

    const handleDeleteService = async (id) => {
        if (window.confirm("Are you sure you want to delete this service?")) {
            try {
                await api.delete(`/services/${id}`);
                fetchData();
            } catch (error) {
                alert("Failed to delete service. It might have bookings associated with it (check backend constraints).");
            }
        }
    };

    const handleDeleteUser = async (id) => {
        if (window.confirm("Delete this user?")) {
            try {
                await api.delete(`/auth/users/${id}`);
                fetchData(role);
                alert("User deleted");
            } catch (error) {
                alert("Failed to delete user");
            }
        }
    };

    const handleAddService = async (e) => {
        e.preventDefault();
        try {
            await api.post('/services', newService);
            setNewService({ title: '', price: '', duration: '', description: '', imageURL: '' });
            fetchData();
            alert("Service added!");
        } catch (error) {
            alert("Failed to add service");
        }
    };

    const handleCreateUser = async (e) => {
        e.preventDefault();
        try {
            await api.post('/auth/register', newUser);
            setNewUser({ username: '', password: '', role: 'admin' });
            fetchData(role);
            alert("User created successfully!");
        } catch (error) {
            console.error(error);
            alert(error.response?.data?.error || "Failed to create user");
        }
    };

    return (
        <div className="container mx-auto p-6">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-3xl font-bold">Admin Dashboard</h1>
                    <p className="text-gray-600">Logged in as: <span className="font-semibold">{username}</span> ({role})</p>
                </div>
                <button
                    onClick={handleLogout}
                    className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition"
                >
                    Logout
                </button>
            </div>

            <div className="flex space-x-4 mb-6 border-b pb-4">
                <button
                    onClick={() => setView('bookings')}
                    className={`px-4 py-2 rounded ${view === 'bookings' ? 'bg-primary text-white' : 'bg-gray-200'}`}
                >
                    Bookings
                </button>
                <button
                    onClick={() => setView('services')}
                    className={`px-4 py-2 rounded ${view === 'services' ? 'bg-primary text-white' : 'bg-gray-200'}`}
                >
                    Manage Services
                </button>
                {role === 'root' && (
                    <button
                        onClick={() => setView('users')}
                        className={`px-4 py-2 rounded ${view === 'users' ? 'bg-primary text-white' : 'bg-gray-200'}`}
                    >
                        User Management
                    </button>
                )}
            </div>

            {view === 'bookings' && (
                <div className="overflow-x-auto bg-white rounded shadow">
                    <table className="min-w-full text-left">
                        <thead className="bg-gray-100 border-b">
                            <tr>
                                <th className="p-4">Date</th>
                                <th className="p-4">Customer</th>
                                <th className="p-4">Service</th>
                                <th className="p-4">Status</th>
                                <th className="p-4">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {bookings.map(b => (
                                <tr key={b.id} className="border-b hover:bg-gray-50">
                                    <td className="p-4">{new Date(b.date).toLocaleString()}</td>
                                    <td className="p-4">
                                        <div className="font-bold">{b.customerName}</div>
                                        <div className="text-sm text-gray-500">{b.phoneNumber}</div>
                                    </td>
                                    <td className="p-4">{b.Service?.title || 'Unknown'}</td>
                                    <td className="p-4">
                                        <span className={`px-2 py-1 rounded text-sm font-bold 
                      ${b.status === 'Approved' ? 'bg-green-100 text-green-800' :
                                                b.status === 'Rejected' ? 'bg-red-100 text-red-800' :
                                                    b.status === 'Completed' ? 'bg-blue-100 text-blue-800' : 'bg-yellow-100 text-yellow-800'}`}>
                                            {b.status}
                                        </span>
                                    </td>
                                    <td className="p-4 flex space-x-2">
                                        {b.status === 'Pending' && (
                                            <>
                                                <button onClick={() => updateStatus(b.id, 'Approved')} className="p-1 bg-green-500 text-white rounded" title="Approve"><Check size={16} /></button>
                                                <button onClick={() => updateStatus(b.id, 'Rejected')} className="p-1 bg-red-500 text-white rounded" title="Reject"><X size={16} /></button>
                                            </>
                                        )}
                                        {b.status === 'Approved' && (
                                            <button onClick={() => updateStatus(b.id, 'Completed')} className="p-1 bg-blue-500 text-white rounded" title="Complete"><Check size={16} /></button>
                                        )}
                                        <button onClick={() => updateStatus(b.id, 'Seen')} className="p-1 bg-gray-500 text-white rounded" title="Mark Seen"><Eye size={16} /></button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {view === 'services' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* List Services */}
                    <div className="bg-white p-6 rounded shadow">
                        <h2 className="text-xl font-bold mb-4">Current Services</h2>
                        <ul className="space-y-2">
                            {services.map(s => (
                                <li key={s.id} className="flex justify-between items-center border-b pb-2">
                                    <span>{s.title} - <b>${s.price}</b></span>
                                    <button
                                        onClick={() => handleDeleteService(s.id)}
                                        className="text-red-500 hover:text-red-700 p-1"
                                        title="Remove Service"
                                    >
                                        <X size={16} />
                                    </button>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Add Service Form */}
                    <div className="bg-white p-6 rounded shadow">
                        <h2 className="text-xl font-bold mb-4">Add New Service</h2>
                        <form onSubmit={handleAddService} className="space-y-3">
                            <input type="text" placeholder="Service Title" className="w-full p-2 border rounded" value={newService.title} onChange={e => setNewService({ ...newService, title: e.target.value })} required />
                            <div className="flex space-x-2">
                                <input type="number" placeholder="Price" className="w-1/2 p-2 border rounded" value={newService.price} onChange={e => setNewService({ ...newService, price: e.target.value })} required />
                                <input type="number" placeholder="Duration (min)" className="w-1/2 p-2 border rounded" value={newService.duration} onChange={e => setNewService({ ...newService, duration: e.target.value })} required />
                            </div>
                            <textarea placeholder="Description" className="w-full p-2 border rounded" value={newService.description} onChange={e => setNewService({ ...newService, description: e.target.value })}></textarea>
                            <input type="text" placeholder="Image URL (optional)" className="w-full p-2 border rounded" value={newService.imageURL} onChange={e => setNewService({ ...newService, imageURL: e.target.value })} />
                            <button type="submit" className="w-full bg-primary text-white py-2 rounded">Add Service</button>
                        </form>
                    </div>
                </div>
            )}

            {view === 'users' && role === 'root' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* User List */}
                    <div className="bg-white p-6 rounded shadow">
                        <h2 className="text-xl font-bold mb-4">Existing Users</h2>
                        {users.length === 0 ? <p className="text-gray-500">No other users found.</p> : (
                            <ul className="space-y-2">
                                {users.map(u => (
                                    <li key={u.id} className="flex justify-between items-center border-b pb-2">
                                        <span><b>{u.username}</b> ({u.role})</span>
                                        {u.role !== 'root' && (
                                            <button
                                                onClick={() => handleDeleteUser(u.id)}
                                                className="text-red-500 hover:text-red-700 p-1"
                                                title="Delete User"
                                            >
                                                <X size={16} />
                                            </button>
                                        )}
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>

                    {/* Create User Form */}
                    <div className="bg-white p-6 rounded shadow">
                        <h2 className="text-xl font-bold mb-4">Create New User</h2>
                        <form onSubmit={handleCreateUser} className="space-y-4">
                            <div>
                                <label className="block text-gray-700 mb-1">Username</label>
                                <input
                                    type="text"
                                    value={newUser.username}
                                    onChange={e => setNewUser({ ...newUser, username: e.target.value })}
                                    className="w-full p-2 border rounded"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-gray-700 mb-1">Password</label>
                                <input
                                    type="password"
                                    value={newUser.password}
                                    onChange={e => setNewUser({ ...newUser, password: e.target.value })}
                                    className="w-full p-2 border rounded"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-gray-700 mb-1">Role</label>
                                <select
                                    value={newUser.role}
                                    onChange={e => setNewUser({ ...newUser, role: e.target.value })}
                                    className="w-full p-2 border rounded"
                                >
                                    <option value="admin">Admin</option>
                                    <option value="root">Root</option>
                                </select>
                            </div>
                            <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700">
                                Create User
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminDashboard;

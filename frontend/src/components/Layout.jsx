import React from 'react';
import { Link } from 'react-router-dom';
import { Scissors } from 'lucide-react';

const Layout = ({ children }) => {
    return (
        <div className="min-h-screen flex flex-col">
            {/* Header */}
            <header className="bg-primary text-white shadow-md">
                <div className="container mx-auto px-4 py-4 flex justify-between items-center">
                    <Link to="/" className="flex items-center space-x-2 text-2xl font-bold text-secondary">
                        <Scissors size={28} />
                        <span>StyleCut Salon</span>
                    </Link>
                    <nav>
                        <ul className="flex space-x-6">
                            <li><Link to="/" className="hover:text-secondary transition">Home</Link></li>
                            {/* Scroll to services section */}
                            <li><a href="/#services" className="hover:text-secondary transition">Services</a></li>
                            <li><Link to="/book" className="hover:text-secondary transition">Book Now</Link></li>
                            <li><Link to="/admin" className="text-gray-400 hover:text-white text-sm">Admin Portal</Link></li>
                        </ul>
                    </nav>
                </div>
            </header>

            {/* Main Content */}
            <main className="flex-grow container mx-auto px-4 py-8">
                {children}
            </main>

            {/* Footer */}
            <footer className="bg-primary text-gray-400 py-6">
                <div className="container mx-auto px-4 text-center">
                    <p>&copy; {new Date().getFullYear()} StyleCut Salon. All rights reserved.</p>
                </div>
            </footer>
        </div>
    );
};

export default Layout;

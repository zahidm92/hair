const sequelize = require('../config/database');
const ServiceModel = require('./Service');
const BookingModel = require('./Booking');
const UserModel = require('./User');

const Service = ServiceModel(sequelize);
const Booking = BookingModel(sequelize);
const User = UserModel(sequelize);

// Associations
Booking.belongsTo(Service);
Service.hasMany(Booking);

module.exports = {
    sequelize,
    Service,
    Booking,
    User
};

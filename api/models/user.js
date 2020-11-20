import mongoose from 'mongoose';

const uniqueValidator = require('mongoose-unique-validator');

const Schema = mongoose.Schema;

const userSchema = new Schema ({
    name:{type: String, required:[true]},
    email: { type: String, unique: true, required: [true]},
    password: { type: String, required: [true]}
});

// Validator
userSchema.plugin(uniqueValidator, { message: 'Error, email already exists.' });

// Convertir a modelo
const User = mongoose.model('User', userSchema);

export default User;
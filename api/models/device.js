import mongoose from 'mongoose';

const uniqueValidator = require('mongoose-unique-validator');

const Schema = mongoose.Schema;

const deviceSchema = new Schema ({
    userId:  { type: String, required: [true] },
    dId: {type: String, unique: true, required: [true]},
    name:{type: String, required:[true]},
    selected: {type: Boolean, required: [true], default: false},
    analogValue: {type: Number, default: null },
    time: {type: Number }
});

// Validator
deviceSchema.plugin(uniqueValidator, { message: 'Error, device already exists.' });

// Convertir a modelo
const Device = mongoose.model('Device', deviceSchema);

export default Device;
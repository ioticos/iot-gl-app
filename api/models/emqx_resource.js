import mongoose from 'mongoose';

const uniqueValidator = require('mongoose-unique-validator');

const Schema = mongoose.Schema;

const emqxResourceSchema = new Schema ({
    rId:{type: String, required:[true]},
    type:{type: String,required:[true]},
    description: {type: String},
    url: {type: String,required:[true]},
});



// Convertir a modelo
const emqxResource = mongoose.model('emqxResource', emqxResourceSchema);

export default emqxResource; 
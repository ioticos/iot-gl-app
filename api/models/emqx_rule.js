import mongoose from 'mongoose';

const Schema = mongoose.Schema;

const emqxRuleSchema = new Schema({
    dId: { type: String, required: [true] },
    rawsql: { type: String, required: [true] },
    id: { type: String, required: [true] },
    description: { type: String, required: [true] },
    type: { type: String, required: [true] }
});



// Convertir a modelo
const EmqxRule = mongoose.model('emqxRule', emqxRuleSchema);

export default EmqxRule; 
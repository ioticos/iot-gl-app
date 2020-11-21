import mongoose from 'mongoose';

const Schema = mongoose.Schema;

const emqxRuleSchema = new Schema({
    userId: {type: String, required: [true]},
    dId: { type: String, required: [true] },
    rawsql: { type: String, required: [true] },
    id: { type: String, required: [true] },
    description: { type: String, required: [true] },
    type: { type: String, required: [true] },
    triggerTime: { type: Number },
    variable: { type: String },
    status:  { type: Boolean },
    condition:  { type: String },
    value: {type: Number}
});



//Convert to model - Convertir a modelo
const EmqxRule = mongoose.model('emqxRule', emqxRuleSchema);

export default EmqxRule;  
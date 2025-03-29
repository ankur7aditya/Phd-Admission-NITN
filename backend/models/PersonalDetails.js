const mongoose = require('mongoose');

const PersonalDetailsSchema = new mongoose.Schema({
    userid: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    first_name: { type: String, required: true },
    last_name: { type: String, required: true },
    dob: { type: Date, required: true },
    gender: { type: String, enum: ["Male", "Female", "Other"], required: true },
    nationality: { type: String, required: true },
    category: { type: String, enum: ["General", "OBC", "SC", "ST", "Other"], required: true },
    religion: { type: String, required: true },
    father_name: { type: String, required: true },
    mother_name: { type: String, required: true },
    marital_status: { type: String, enum: ["Single", "Married", "Divorced", "Widowed"], required: true },
    spouse_name: { type: String },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    alternate_phone: { type: String },
    communication_address: {
        street: { type: String, required: true },
        line2: { type: String },
        line3: { type: String },
        city: { type: String, required: true },
        state: { type: String, required: true },
        pincode: { type: String, required: true }
    },
    permanent_address: {
        street: { type: String, required: true },
        line2: { type: String },
        line3: { type: String },
        city: { type: String, required: true },
        state: { type: String, required: true },
        pincode: { type: String, required: true }
    },
    photo: { type: String },
    signature: { type: String }
}, { timestamps: true });

const PersonalDetails = mongoose.model("PersonalDetails", PersonalDetailsSchema);
module.exports = PersonalDetails; 
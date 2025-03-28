const mongoose = require("mongoose");

const PersonalDetailsSchema = new mongoose.Schema({
  userid: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, // Reference 'User' model
  applicant_name: { type: String, required: true },
  email: { type: String, required: true },
  date_of_birth: { type: Date, required: true },
  gender: { type: String, enum: ["Male", "Female", "Other"], default: "" },
  mobile_no: { type: String, default: "" },
  languages_known: [{ type: String, default: "" }],
  blood_group: { type: String, default: "" },
  nationality: { type: String, default: "" },
  marital_status: { type: String, enum: ["Single", "Married"], default: "" },
  disability_status: { type: String, default: "" },
  present_category: { type: String, default: "" },
  
  guardian_details: {
    name: { type: String, default: "" },
    relationship: { type: String, default: "" },
  },

  communication_address: {
    address_line1: { type: String, default: "" },
    address_line2: { type: String, default: "" },
    address_line3: { type: String, default: "" },
    city: { type: String, default: "" },
    state: { type: String, default: "" },
    pin_code: { type: String, default: "" },
  },

  permanent_address: {
    same_as_communication: { type: Boolean, default: false },
    address_line1: { type: String, default: "" },
    address_line2: { type: String, default: "" },
    address_line3: { type: String, default: "" },
    city: { type: String, default: "" },
    state: { type: String, default: "" },
    pin_code: { type: String, default: "" },
  },

  photos: {
    profile_photo: { type: String, default: "" }, // Store URL or path
    signature: { type: String, default: "" }, // Store URL or path
  },
}, { timestamps: true });

const PersonalDetails = mongoose.model("PersonalDetails", PersonalDetailsSchema);
module.exports = PersonalDetails;

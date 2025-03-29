const mongoose = require('mongoose');

const PersonalDetailsSchema = new mongoose.Schema({
    userid: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: "User", 
        required: [true, "User ID is required"] 
    },
    first_name: { 
        type: String, 
        required: [true, "First name is required"],
        trim: true,
        minlength: [2, "First name must be at least 2 characters long"],
        maxlength: [30, "First name cannot exceed 30 characters"]
    },
    last_name: { 
        type: String, 
        required: [true, "Last name is required"],
        trim: true,
        minlength: [2, "Last name must be at least 2 characters long"],
        maxlength: [30, "Last name cannot exceed 30 characters"]
    },
    dob: { 
        type: Date, 
        required: [true, "Date of birth is required"],
        validate: {
            validator: function(v) {
                const age = new Date().getFullYear() - v.getFullYear();
                return age >= 18 && age <= 50;
            },
            message: "Applicant must be between 18 and 50 years old"
        }
    },
    gender: { 
        type: String, 
        enum: {
            values: ["Male", "Female", "Other"],
            message: "{VALUE} is not a valid gender"
        },
        required: [true, "Gender is required"]
    },
    nationality: { 
        type: String, 
        required: [true, "Nationality is required"],
        trim: true
    },
    category: { 
        type: String, 
        enum: {
            values: ["General", "OBC", "SC", "ST", "Other"],
            message: "{VALUE} is not a valid category"
        },
        required: [true, "Category is required"]
    },
    religion: { 
        type: String, 
        required: [true, "Religion is required"],
        trim: true
    },
    father_name: { 
        type: String, 
        required: [true, "Father's name is required"],
        trim: true
    },
    mother_name: { 
        type: String, 
        required: [true, "Mother's name is required"],
        trim: true
    },
    marital_status: { 
        type: String, 
        enum: {
            values: ["Single", "Married", "Divorced", "Widowed"],
            message: "{VALUE} is not a valid marital status"
        },
        required: [true, "Marital status is required"]
    },
    spouse_name: { 
        type: String,
        trim: true,
        validate: {
            validator: function(v) {
                return !v || (this.marital_status !== "Single" && v.length > 0);
            },
            message: "Spouse name is required for married, divorced, or widowed applicants"
        }
    },
    email: { 
        type: String, 
        required: [true, "Email is required"],
        match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, "Please enter a valid email"]
    },
    phone: { 
        type: String, 
        required: [true, "Phone number is required"],
        match: [/^[0-9]{10}$/, "Please enter a valid 10-digit mobile number"]
    },
    alternate_phone: { 
        type: String,
        match: [/^[0-9]{10}$/, "Please enter a valid 10-digit mobile number"]
    },
    communication_address: {
        street: { 
            type: String, 
            required: [true, "Street address is required"],
            trim: true
        },
        line2: { 
            type: String,
            trim: true
        },
        line3: { 
            type: String,
            trim: true
        },
        city: { 
            type: String, 
            required: [true, "City is required"],
            trim: true
        },
        state: { 
            type: String, 
            required: [true, "State is required"],
            trim: true
        },
        pincode: { 
            type: String, 
            required: [true, "PIN code is required"],
            match: [/^[0-9]{6}$/, "Please enter a valid 6-digit PIN code"]
        }
    },
    permanent_address: {
        street: { 
            type: String, 
            required: [true, "Street address is required"],
            trim: true
        },
        line2: { 
            type: String,
            trim: true
        },
        line3: { 
            type: String,
            trim: true
        },
        city: { 
            type: String, 
            required: [true, "City is required"],
            trim: true
        },
        state: { 
            type: String, 
            required: [true, "State is required"],
            trim: true
        },
        pincode: { 
            type: String, 
            required: [true, "PIN code is required"],
            match: [/^[0-9]{6}$/, "Please enter a valid 6-digit PIN code"]
        }
    },
    photo: { 
        type: String,
        validate: {
            validator: function(v) {
                return !v || /^https?:\/\/.+/.test(v);
            },
            message: "Photo URL must be valid"
        }
    },
    signature: { 
        type: String,
        validate: {
            validator: function(v) {
                return !v || /^https?:\/\/.+/.test(v);
            },
            message: "Signature URL must be valid"
        }
    },
    dd_url: {
        type: String,
        required: false
    }
}, { timestamps: true });

const PersonalDetails = mongoose.model("PersonalDetails", PersonalDetailsSchema);
module.exports = PersonalDetails; 
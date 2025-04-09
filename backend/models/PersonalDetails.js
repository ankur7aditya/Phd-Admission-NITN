const mongoose = require('mongoose');

const PersonalDetailsSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    // Personal Information
    name: {
        type: String,
        required: [true, 'Name is required'],
        trim: true,
        minlength: [2, 'Name must be at least 2 characters long'],
        maxlength: [30, 'Name cannot exceed 30 characters'],
        match: [/^[a-zA-Z\s]*$/, 'Name can only contain letters and spaces']
    },
    date_of_birth: {
        type: Date,
        required: [true, 'Date of birth is required'],
        validate: {
            validator: function(dob) {
                const today = new Date();
                const birthDate = new Date(dob);
                const age = today.getFullYear() - birthDate.getFullYear();
                return age >= 18 && age <= 50;
            },
            message: 'Age must be between 18 and 50 years'
        }
    },
    gender: {
        type: String,
        required: [true, 'Gender is required'],
        enum: ['Male', 'Female', 'Other']
    },
    phone: {
        type: String,
        required: [true, 'Phone number is required'],
        match: [/^[0-9]{10}$/, 'Please enter a valid 10-digit mobile number']
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email address']
    },

    // Address Information
    current_address: {
        street: {
            type: String,
            required: [true, 'Street address is required']
        },
        city: {
            type: String,
            required: [true, 'City is required']
        },
        state: {
            type: String,
            required: [true, 'State is required']
        },
        pincode: {
            type: String,
            required: [true, 'PIN code is required'],
            match: [/^[0-9]{6}$/, 'Please enter a valid 6-digit PIN code']
        },
        country: {
            type: String,
            required: [true, 'Country is required'],
            default: 'India'
        }
    },
    permanent_address: {
        street: {
            type: String,
            required: [true, 'Street address is required']
        },
        city: {
            type: String,
            required: [true, 'City is required']
        },
        state: {
            type: String,
            required: [true, 'State is required']
        },
        pincode: {
            type: String,
            required: [true, 'PIN code is required'],
            match: [/^[0-9]{6}$/, 'Please enter a valid 6-digit PIN code']
        },
        country: {
            type: String,
            required: [true, 'Country is required'],
            default: 'India'
        }
    },

    // Document Uploads
    photo: {
        url: String,
        public_id: String
    },
    signature: {
        url: String,
        public_id: String
    },
    id_proof: {
        url: String,
        public_id: String
    },

    // Status
    status: {
        type: String,
        enum: ['draft', 'submitted'],
        default: 'draft'
    },
    submitted_at: {
        type: Date
    }
}, {
    timestamps: true
});

// Index for faster queries
PersonalDetailsSchema.index({ user: 1 });
PersonalDetailsSchema.index({ email: 1 });

module.exports = mongoose.model('PersonalDetails', PersonalDetailsSchema); 
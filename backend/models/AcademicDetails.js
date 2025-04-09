const mongoose = require('mongoose');

const QualificationSchema = new mongoose.Schema({
    standard: {
        type: String,
        required: [true, 'Qualification level is required'],
        enum: ['10th', '12th', 'UG', 'PG', 'PhD']
    },
    degree_name: {
        type: String,
        required: [true, 'Degree name is required']
    },
    university: {
        type: String,
        required: [true, 'University/Board name is required']
    },
    year_of_completion: {
        type: Number,
        required: [true, 'Year of completion is required'],
        validate: {
            validator: function(year) {
                const currentYear = new Date().getFullYear();
                return year <= currentYear && year >= 1950;
            },
            message: 'Year must be between 1950 and current year'
        }
    },
    marks_type: {
        type: String,
        required: [true, 'Marks type is required'],
        enum: ['Percentage', 'CGPA']
    },
    marks_obtained: {
        type: Number,
        required: [true, 'Marks obtained is required'],
        validate: {
            validator: function(value) {
                if (this.marks_type === 'Percentage') {
                    return value >= 0 && value <= 100;
                } else if (this.marks_type === 'CGPA') {
                    return value >= 0 && value <= 10;
                }
                return true;
            },
            message: 'Invalid marks for the selected type'
        }
    },
    branch: {
        type: String,
        required: [true, 'Branch/Specialization is required']
    },
    program_duration_months: {
        type: Number,
        required: [true, 'Program duration is required'],
        min: [0, 'Program duration cannot be negative']
    },
    certificate_url: {
        type: String
    },
    certificate_public_id: {
        type: String
    }
});

const QualifyingExamSchema = new mongoose.Schema({
    exam_type: {
        type: String,
        required: [true, 'Exam type is required'],
        enum: ['CAT', 'GATE', 'GMAT', 'NET', 'Others']
    },
    registration_no: {
        type: String,
        required: [true, 'Registration number is required']
    },
    year: {
        type: Number,
        required: [true, 'Year is required'],
        validate: {
            validator: function(year) {
                const currentYear = new Date().getFullYear();
                return year <= currentYear && year >= 1950;
            },
            message: 'Year must be between 1950 and current year'
        }
    },
    score: {
        type: Number,
        required: [true, 'Score is required']
    },
    percentile: {
        type: Number,
        required: [true, 'Percentile is required'],
        min: [0, 'Percentile cannot be negative'],
        max: [100, 'Percentile cannot exceed 100']
    },
    validity: {
        type: Date,
        required: [true, 'Validity date is required']
    },
    certificate_url: {
        type: String
    },
    certificate_public_id: {
        type: String
    }
});

const ExperienceSchema = new mongoose.Schema({
    organization: {
        type: String,
        required: [true, 'Organization name is required']
    },
    designation: {
        type: String,
        required: [true, 'Designation is required']
    },
    from_date: {
        type: Date,
        required: [true, 'Start date is required']
    },
    to_date: {
        type: Date,
        required: [true, 'End date is required']
    },
    experience_letter_url: {
        type: String
    },
    experience_letter_public_id: {
        type: String
    }
});

const PublicationSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Publication title is required']
    },
    journal: {
        type: String,
        required: [true, 'Journal name is required']
    },
    year: {
        type: Number,
        required: [true, 'Publication year is required'],
        validate: {
            validator: function(year) {
                const currentYear = new Date().getFullYear();
                return year <= currentYear && year >= 1950;
            },
            message: 'Year must be between 1950 and current year'
        }
    },
    doi: {
        type: String
    },
    publication_url: {
        type: String
    },
    publication_public_id: {
        type: String
    }
});

const AcademicDetailsSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    qualifications: [QualificationSchema],
    qualifying_exams: [QualifyingExamSchema],
    work_experience: [ExperienceSchema],
    publications: [PublicationSchema],
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

// Indexes for faster queries
AcademicDetailsSchema.index({ user: 1 });
AcademicDetailsSchema.index({ 'qualifications.year_of_completion': 1 });
AcademicDetailsSchema.index({ 'qualifying_exams.year': 1 });

module.exports = mongoose.model('AcademicDetails', AcademicDetailsSchema);

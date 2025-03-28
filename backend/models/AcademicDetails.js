import mongoose from 'mongoose';

const AcademicDetailsSchema = new mongoose.Schema({
  userid: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },

  qualifications: [
    {
      standard: { type: String, required: true }, // Example: 10th, 12th, UG, PG, PhD
      degree_name: { type: String, required: true }, // Name of Degree/Exam
      university: { type: String, required: true }, // University/Board
      year_of_completion: { type: Number, required: true }, // Year of completion
      marks_type: { type: String, enum: ["Percentage", "CGPA"], required: true }, // Choose Marks/CGPA
      marks_obtained: { type: Number, required: true }, // Either percentage or CGPA
      max_cgpa: { type: Number, default: 10 }, // Max CGPA (optional)
      branch: { type: String, default: "" }, // Branch/Specialization
      program_duration_months: { type: Number, required: true }, // Duration in months
      document_url: { type: String }, // URL for uploaded mark sheet, certificate, or transcript
    }
  ],

  qualifying_exams: [
    {
      exam_type: { type: String, enum: ["CAT", "GATE", "GMAT", "NET", "Others"], required: true },
      registration_no: { type: String, required: true },
      year_of_qualification: { type: Number, required: true },

      // Fields specific to CAT
      cat_details: {
        total_score: { type: Number },
        total_percentile: { type: Number },
        quant_score: { type: Number },
        quant_percentile: { type: Number },
        di_lr_score: { type: Number },
        di_lr_percentile: { type: Number },
        verbal_score: { type: Number },
        verbal_percentile: { type: Number },
      },

      // Fields specific to GATE
      gate_details: {
        discipline: { type: String },
        gate_score: { type: Number },
        gate_rank: { type: Number },
        marks_out_of_100: { type: Number },
        qualifying_marks: { type: Number },
      },

      // Fields specific to GMAT
      gmat_details: {
        total_score: { type: Number },
        verbal_score: { type: Number },
        quantitative_score: { type: Number },
        analytical_writing_score: { type: Number },
        integrated_reasoning_score: { type: Number },
      },

      // Fields specific to NET
      net_details: {
        type: { type: String, enum: ["With Fellowship", "Without Fellowship"], required: true },
      },

      exam_certificate_url: { type: String }, // Document upload for scorecard or certificate
    }
  ],

  experience: [
    {
      type: { type: String, enum: ["Industry", "Academia", "Research"], required: true },
      organisation: { type: String, required: true },
      place: { type: String, required: true },
      period_from: { type: Date, required: true },
      period_to: { type: Date },
      monthly_compensation: { type: Number },
      designation: { type: String },
      nature_of_work: { type: String },
      experience_certificate_url: { type: String }, // Upload experience certificate
    }
  ],

  publications: [
    {
      type: { type: String, enum: ["Journal", "Conference", "Book"], required: true },
      paper_title: { type: String, required: true },
      affiliation: { type: String, required: true },
      acceptance_year: { type: Number, required: true },
      document_url: { type: String }, // Upload research paper or acceptance letter
    }
  ],

}, { timestamps: true });

const AcademicDetails = mongoose.model("AcademicDetails", AcademicDetailsSchema);
export default AcademicDetails;

import { AcademicDetails } from '../models/AcademicDetails.js';

// 🔹 Add/Update Academic Details
export const createAcademic = async (req, res) => {
  try {
    const academic = new AcademicDetails({
      ...req.body,
      userId: req.user.id
    });
    await academic.save();
    res.status(201).json(academic);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getAcademic = async (req, res) => {
  try {
    const academic = await AcademicDetails.findOne({ userId: req.user.id });
    if (!academic) {
      return res.status(404).json({ message: "Academic details not found" });
    }
    res.json(academic);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateAcademic = async (req, res) => {
  try {
    const academic = await AcademicDetails.findOneAndUpdate(
      { userId: req.user.id },
      req.body,
      { new: true }
    );
    if (!academic) {
      return res.status(404).json({ message: "Academic details not found" });
    }
    res.json(academic);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const uploadAcademicDocument = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: "No file uploaded" });
  }
  const uploadImageUrl = await uploadOnCloudinary(req.file.path);
  res.json({ message: "Academic document uploaded successfully", fileUrl: req.file.path });
};

module.exports = { createAcademic, getAcademic, updateAcademic, uploadAcademicDocument };

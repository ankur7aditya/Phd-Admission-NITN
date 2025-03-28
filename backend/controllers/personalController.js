const PersonalDetails = require("../models/PersonalDetails");

const addPersonalDetails = async (req, res) => {
  try {
    const userid = req.user.id;
    const details = req.body;
    const usernameid = user.usernameid;
    let personalDetails = await PersonalDetails.findOne({ userid });

    if (personalDetails) {
      
      personalDetails = await PersonalDetails.findOneAndUpdate(
        { userid },
        { $set: details },
        { new: true }
      );
      return res.status(200).json({ message: "Personal details updated", personalDetails });
    }

    
    personalDetails = new PersonalDetails({ userid,usernameid, ...details });
    await personalDetails.save();

    res.status(201).json({ message: "Personal details saved", personalDetails });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getPersonalDetails = async (req, res) => {
  try {
    const userid = req.user.id; 
    const personalDetails = await PersonalDetails.findOne({ userid });

    if (!personalDetails) {
      return res.status(404).json({ message: "Personal details not found" });
    }

    res.status(200).json(personalDetails);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


const uploadPersonalDocument = (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: "No file uploaded" });
  }

  res.json({ message: "Personal document uploaded successfully", fileUrl: req.file.path });
};

module.exports = { addPersonalDetails, getPersonalDetails, uploadPersonalDocument };

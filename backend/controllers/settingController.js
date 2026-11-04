import asyncHandler from "../middleware/asyncHandler.js";
import Setting from "../models/Setting.js";

export const getSettings = asyncHandler(async (req, res) => {
  const settings = await Setting.findOne().lean();
  res.json(settings || {});
});

export const updateSettings = asyncHandler(async (req, res) => {
  const payload = {
    companyName: req.body.companyName,
    phone: req.body.phone,
    email: req.body.email,
    address: req.body.address,
    whatsappNumber: req.body.whatsappNumber,
    instagram: req.body.instagram,
    facebook: req.body.facebook,
    footerText: req.body.footerText,
    logo: req.body.logo,
  };

  // Only overwrite fields that were actually sent.
  Object.keys(payload).forEach((key) => {
    if (payload[key] === undefined) delete payload[key];
  });

  const settings = await Setting.findOneAndUpdate(
    {},
    { $set: payload },
    { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true }
  );

  res.json(settings);
});

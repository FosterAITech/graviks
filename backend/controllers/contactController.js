import Contact from "../models/Contact.js";

import asyncHandler from "../middleware/asyncHandler.js";

export const getContacts = asyncHandler(async (req, res) => {
  const contacts = await Contact.find().sort({ createdAt: -1 }).lean();
  res.json(contacts);
});

export const createContact = asyncHandler(async (req, res) => {
  const { name, email, phone, message } = req.body;

  if (!name || !email || !phone || !message) {
    res.status(400);
    throw new Error("Name, email, phone, and message are required");
  }

  const contact = await Contact.create({ name, email, phone, message });

  res.status(201).json({
    success: true,
    message: "Thank you. Your enquiry has been saved.",
    contact
  });
});

export const updateContactStatus = asyncHandler(async (req, res) => {
  const contact = await Contact.findById(req.params.id);
  if (!contact) {
    res.status(404);
    throw new Error("Contact not found");
  }

  const { status } = req.body;
  if (status) {
    contact.status = status;
  }

  await contact.save();
  res.json(contact);
});

export const deleteContact = asyncHandler(async (req, res) => {
  const contact = await Contact.findById(req.params.id);
  if (!contact) {
    res.status(404);
    throw new Error("Contact not found");
  }

  await contact.deleteOne();
  res.json({ message: "Contact deleted successfully" });
});
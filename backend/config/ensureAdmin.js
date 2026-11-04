import User from "../models/User.js";

// Creates the admin account from ADMIN_EMAIL / ADMIN_PASSWORD the first time the API starts.
// To change the password later, update ADMIN_PASSWORD and set ADMIN_RESET_PASSWORD=true for one deploy.
const ensureAdminUser = async () => {
  const email = process.env.ADMIN_EMAIL?.toLowerCase().trim();
  const password = process.env.ADMIN_PASSWORD;

  if (!email || !password) {
    console.warn("ADMIN_EMAIL / ADMIN_PASSWORD not set: no admin account created.");
    return;
  }

  try {
    const existing = await User.findOne({ email });

    if (!existing) {
      await User.create({ name: "Garviks Admin", email, password, role: "admin" });
      console.log(`Admin account created for ${email}`);
      return;
    }

    let changed = false;
    if (existing.role !== "admin") {
      existing.role = "admin";
      changed = true;
    }
    if (process.env.ADMIN_RESET_PASSWORD === "true") {
      existing.password = password;
      changed = true;
    }
    if (changed) await existing.save();
  } catch (error) {
    console.error("Could not set up the admin account:", error.message);
  }
};

export default ensureAdminUser;

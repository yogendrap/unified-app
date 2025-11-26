import express from "express";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import Organization from "../models/Organization.js";
import Membership from "../models/Membership.js";
import nodemailer from "nodemailer";

const router = express.Router();

// 🔹 Generate JWT
const generateToken = (user) => {
  return jwt.sign({ id: user._id, email: user.email }, process.env.JWT_SECRET, {
    expiresIn: "1h",
  });
};

function transporter() {
  return nodemailer.createTransport({
    service: "gmail",
    auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
  });
}

// async function notifySuperAdminsNewOrg(user, org) {
//   const supers = await User.find({ isGlobalAdmin: true, isActive: true });
//   if (!supers.length) return;
//   const emails = supers.map((u) => u.email).join(",");
//   const t = transporter();
//   await t.sendMail({
//     from: `"Unified App" <${process.env.EMAIL_USER}>`,
//     to: emails,
//     subject: `Approval required: activate org "${org.name}"`,
//     html: `<p>User <b>${user.email}</b> registered and created org <b>${org.name}</b> (${org.domain}).</p>
//            <p>Please approve the initial admin membership in your Super Admin panel.</p>`,
//   });
// }

async function notifyOrgAdminsPending(orgId, newUser) {
  const adminMemberships = await Membership.find({ organizationId: orgId, role: "admin", status: "approved" })
                                           .populate("userId", "email isActive");
  if (!adminMemberships.length) return;
  const emails = adminMemberships.map((m) => m.userId?.email).filter(Boolean);
  if (!emails.length) return;
  console.log("Notifying org admins at emails:", emails);
  const t = transporter();
  await t.sendMail({
    from: `"Unified App" <${process.env.EMAIL_USER}>`,
    to: emails.join(","),
    subject: `Approval needed: new member ${newUser.email}`,
    html: `<p>Please review the pending membership for <b>${newUser.email}</b> in your Org Admin panel.</p>`,
  });
  console.log("Notification sent to org admins.", emails.join(","));
}

// 🧾 Register
// Extract org name from email domain
function getOrgInfoFromEmail(email) {
  const domainPart = email.split("@")[1].toLowerCase();
  const parts = domainPart.split(".");
  const orgName = parts.length >= 2 ? parts[parts.length - 2] : parts[0];
  return { domain: domainPart, name: orgName };
}

router.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!email || !password || !name) return res.status(400).json({ message: "Missing fields" });

    const existed = await User.findOne({ email });
    if (existed) return res.status(400).json({ message: "User already exists" });

    const { domain, name: orgName } = getOrgInfoFromEmail(email);
    let org = await Organization.findOne({ name: orgName });
    
    if (!org) {
      const user = await User.create({ name, email, password, isActive: true, isGlobalAdmin: false });

      // create org, mark inactive until super-admin approves the first admin
      org = await Organization.create({ name: orgName, domain, createdBy: user._id, isActive: true });

      await Membership.create({
        userId: user._id,
        organizationId: org._id,
        role: "admin",
        status: "approved",
      });

      // notify super admins
      //await notifySuperAdminsNewOrg(user, org);

      return res.status(201).json({
        message:
          "Registered. Org created and You will be able to login.",
        pending: true,
      });
    } else {
      const user = await User.create({ name, email, password, isActive: false, isGlobalAdmin: false });
      // existing org → pending for org admins
      await Membership.create({
        userId: user._id,
        organizationId: org._id,
        role: "member",
        status: "pending_admin",
      });

      // notify org admins
      await notifyOrgAdminsPending(org._id, user);

      return res.status(201).json({
        message:
          "Registered. Your membership is pending approval by org admins. You will be able to login after approval.",
        pending: true,
      });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
});


// 🔐 Login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    console.log("Login attempt for user:", user);
    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ message: "Invalid credentials" });
    }
    // console.log("Login attempt for user:", user);
    
    if (!user.isActive) {
      console.log("Account inactive for user:", user.email);
      return res
        .status(403)
        .json({ message: "Account pending approval. You will be able to login after approval." });
    }
    const token = generateToken(user);
    res.json({
      token,
      user: { id: user._id, name: user.name, email: user.email, isGlobalAdmin: user.isGlobalAdmin },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


// 🔒 Verify Token
router.get("/verify", async (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ message: "No token" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    res.json({ valid: true, user: decoded });
  } catch {
    res.status(403).json({ valid: false, message: "Invalid token" });
  }
});

router.get("/profile", async (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
     if (!token) return res.status(401).json({ message: "No token" });
     const decoded = jwt.verify(token, process.env.JWT_SECRET);
   // res.json({ valid: true, user: decoded });
    req.user = await User.findById(decoded.id).select("-password");
    console.log("Authenticated user:", req.user);
    const user = await User.findById(req.user._id).select("-password");
    if (user) {
      res.json(user);
    } else {
      res.status(404).json({ message: "User not found" });
    }
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

// PUT /api/user/profile
router.put("/profile", async (req, res) => {
  try {
     const token = req.headers.authorization?.split(" ")[1];
     if (!token) return res.status(401).json({ message: "No token" });
     const decoded = jwt.verify(token, process.env.JWT_SECRET);
   // res.json({ valid: true, user: decoded });
    req.user = await User.findById(decoded.id).select("-password");
    console.log("Authenticated user:", req.user);
    const user = await User.findById(req.user._id);

    if (user) {
      user.name = req.body.name || user.name;
      user.email = req.body.email || user.email;
      //user.avatar = req.body.avatar || user.avatar;

      const updatedUser = await user.save();

      res.json({
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
      });
    } else {
      res.status(404).json({ message: "User not found" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
} );

export default router;

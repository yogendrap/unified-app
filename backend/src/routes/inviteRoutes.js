import express from "express";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import nodemailer from "nodemailer";
import User from "../models/User.js";
import Organization from "../models/Organization.js";
import Membership from "../models/Membership.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// Send an invite
router.post("/send", protect, async (req, res) => {
  //console.log("Invite request received", req);
    try {
    const { email, organizationId, inviteRole } = req.body;
    const inviter = req.user;
    console.log("Inviter:", req.body);
    if (!email) return res.status(400).json({ message: "Email is required" });
    const token = crypto.randomBytes(32).toString("hex");
    // find inviter org (assuming 1 active org)
    //const orgId = inviter.organizations?.[0];
    //if (!orgId) return res.status(400).json({ message: "You are not part of any organization" });

    const org = await Organization.findById(organizationId);
    //if (!org) return res.status(404).json({ message: "Organization not found" });
    console.log("Organization:", org);
    //let invitedUser = await User.findOne({ email });
   var invitedUser = await User.findOne({
         //inviteStatus: { $ne: 'pending' },
         email: email
    });
    if (invitedUser) {
      // if user exists
      // check if already member
      const exists = await Membership.findOne({
        userId: invitedUser._id,
        organizationId: organizationId,
      });
      if (exists)
       return res.status(400).json({ message: "User already a member of this organization" });
      
      var invitedPendingUser = await User.findOne({
         inviteStatus: { $eq: 'pending' },
         email: email
    });
    
    if(!invitedPendingUser){
      // else add membership directly
      await Membership.create({
        userId: invitedUser._id,
        organizationId: organizationId,
        role: inviteRole,
        status: "approved",
      });
      return res.json({ message: "Already member of a organization and adding to your organization successfully" });
    }
     //invitedUser.organizations.push(organizationId);
      //await invitedUser.save();

      return res.json({ message: "Invitation send succesfuly" });
    } else {

    // else, create a placeholder user (no password yet)
    
    invitedUser = await User.create({
      email,
      inviteToken: token,
      inviteStatus: "pending",
      inviteOrg: organizationId,
      inviteRole: inviteRole,
    });
}
    sendInviteEmail(token, inviter, email, org.name, inviteRole);
    res.json({ message: `Invitation email sent to ${email}` });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
});

async function sendInviteEmail(token, inviter, email, orgName, inviteRole) {
  const inviteUrl = `${process.env.FRONTEND_URL}/invite/accept?token=${token}`;

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });

  const message = {
    from: `"Unified App" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: `${inviter.name} invited you to join ${orgName}`,
    html: `
      <h2>You’ve been invited to join <b>${orgName}</b></h2>
      <h2>You’ve been invited to join as a <b>${inviteRole}</b></h2>
      <p>${inviter.name} has invited you to collaborate in UnifiedApp.</p>
      <p><a href="${inviteUrl}" style="background:#2563eb;color:white;padding:10px 20px;border-radius:6px;text-decoration:none;">Accept Invite</a></p>
    `
  };

  await transporter.sendMail(message);
}
// Accept invite (for new users)
router.post("/accept", async (req, res) => {
  try {
    const { token, name, password } = req.body;

    if (!token) return res.status(400).json({ message: "Invite token missing" });
    const user = await User.findOne({ inviteToken: token }).populate("inviteOrg");
    if (!user) return res.status(400).json({ message: "Invalid or expired invite token" });

    // set user details
    user.name = name;
    user.password = password;
    user.isActive = true;
   // user.organizations.push(user.inviteOrg._id);
    user.inviteToken = null;
    const org = user.inviteOrg;
    user.inviteOrg = null;
    const role = user.inviteRole;

    await user.save();

    // add membership
    await Membership.create({
      userId: user._id,
      organizationId: org._id,
      role: role,
      status: "approved",
    });

    const tokenJWT = jwt.sign({ id: user._id, email: user.email }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    res.json({
      message: "Invite accepted successfully",
      token: tokenJWT,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        organizations: user.organizations,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
});

export default router;

import express from "express";
import jwt from "jsonwebtoken";
import Organization from "../models/Organization.js";
import User from "../models/User.js";

const router = express.Router();

// Middleware to check auth token
const auth = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ message: "No token" });
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch {
    return res.status(403).json({ message: "Invalid token" });
  }
};

// POST /api/orgs/create
router.post("/create", auth, async (req, res) => {
  try {
    const { name, description } = req.body;
    const creator = await User.findById(req.user.id);
    if (!creator) return res.status(404).json({ message: "User not found" });

    const orgExists = await Organization.findOne({ name });
    if (orgExists) return res.status(400).json({ message: "Organization already exists" });

    const org = await Organization.create({
      name,
      description,
      createdBy: creator._id,
      members: [creator._id],
    });

    // Link to user
    creator.organizations.push(org._id);
    await creator.save();

    res.status(201).json({ message: "Organization created", org });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET /api/orgs/my
// router.get("/my", auth, async (req, res) => {
//   try {
//     const user = await User.findById(req.user.id).populate("organizations");
//     res.json({ organizations: user.organizations });
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// });

router.get("/my",auth , async (req, res) => {
    //console.log("Fetching organization for user:", req);
  const orgId = req.query.orgId;
  try {
  console.log("Received orgId:", orgId);
  if (!orgId) return res.status(400).json({ message: "orgId is required" });

  const org = await Organization.find({ _id: orgId });
  console.log("Organization found:", org);
  res.json(org);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;

import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: false },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: false },
    isGlobalAdmin: { type: Boolean, default: false },
    isActive: { type: Boolean, default: false }, 
    inviteStatus: { type: String, default: null },
    inviteToken: { type: String, default: null },
    inviteOrg: { type: mongoose.Schema.Types.ObjectId, ref: "Organization", default: null },
    inviteRole: { type: String, default: null },

  },
  { timestamps: true }
);

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

userSchema.methods.matchPassword = async function (enteredPassword) {
  if(!this.password) return false;
  return await bcrypt.compare(enteredPassword, this.password);
};

export default mongoose.model("User", userSchema);

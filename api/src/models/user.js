const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const MODELNAME = "User";

const UserSchema = new mongoose.Schema({
  name: { type: String, trim: true },
  organisation_name: { type: String, trim: true },

  email: { type: String, required: true, unique: true, trim: true },

  avatar: {
    type: String,
    default: "https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y",
  },

  password: String,
  role: { type: String, enum: ["user", "admin"], default: "user" },

  forgot_password_reset_token: { type: String, default: "" },
  forgot_password_reset_expires: { type: Date },

  last_login_at: { type: Date, default: Date.now },
  createdAt: { type: Date, default: Date.now },
});

// Hash password if modified
UserSchema.pre("save", function (next) {
  if (this.isModified("password") || this.isNew) {
    bcrypt.hash(this.password, 10, (e, hash) => {
      this.password = hash;
      return next();
    });
  } else next();
});

UserSchema.methods.comparePassword = function (p) {
  return bcrypt.compare(p, this.password || "");
};

module.exports = mongoose.models[MODELNAME] || mongoose.model(MODELNAME, UserSchema);

import mongoose, { Schema, model, models } from "mongoose";

const settingsSchema = new Schema({
  stripePK: {
    type: String,
    default: "",
  },
  stripeSK: {
    type: String,
    default: "",
  },
}, {
  timestamps: true,
});

export default models.Settings || model("Settings", settingsSchema);
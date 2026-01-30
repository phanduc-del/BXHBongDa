import mongoose from "mongoose";

const playerSchema = new mongoose.Schema({
 name: { type: String, required: true },
 avatar: String
});

export default mongoose.model("Player", playerSchema);

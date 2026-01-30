import mongoose from "mongoose";

const seasonSchema = new mongoose.Schema({
 name: String,
 players: [
  {
   name: String,
   manual: {
    w: Number,
    d: Number,
    l: Number
   },
   auto: {
    mp: Number,
    w: Number,
    d: Number,
    l: Number,
    gf: Number,
    ga: Number
   },
   mp: Number,
   w: Number,
   d: Number,
   l: Number,
   gf: Number,
   ga: Number,
   pts: Number
  }
 ],
 matches: [
  {
   a: String,
   b: String,
   ga: Number,
   gb: Number
  }
 ]
}, { timestamps: true });

export default mongoose.model("Season", seasonSchema);

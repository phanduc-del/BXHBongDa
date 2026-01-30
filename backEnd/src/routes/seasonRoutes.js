import express from "express";
import Season from "../models/Season.js";

const router = express.Router();

router.post("/", async (req, res) => {
 try {
  const season = await Season.create(req.body);
  res.json(season);
 } catch (err) {
  res.status(500).json({ message: err.message });
 }
});

router.get("/", async (req, res) => {
 try {
  const seasons = await Season.find();
  res.json(seasons);
 } catch (err) {
  res.status(500).json({ message: err.message });
 }
});
router.put("/:id", async (req, res) => {
 try {
  const season = await Season.findByIdAndUpdate(
   req.params.id,
   req.body,
   { new: true }
  );
  res.json(season);
 } catch (err) {
  res.status(500).json({ message: err.message });
 }
});


export default router;

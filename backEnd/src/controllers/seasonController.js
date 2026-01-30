import Season from "../models/Season.js";
import { recalcSeason } from "../utils/recalcTable.js";

export const createSeason = async (req, res) => {
 const season = new Season(req.body);
 await season.save();
 res.json(season);
};

export const getSeasons = async (req, res) => {
 const seasons = await Season.find();
 res.json(seasons);
};

export const deleteSeason = async (req, res) => {
 await Season.findByIdAndDelete(req.params.id);
 res.json({ message: "Deleted" });
};

import Season from "../models/Season.js";
import { recalcSeason } from "../utils/recalcTable.js";

export const addMatch = async (req, res) => {
 const { seasonId, a, b, ga, gb } = req.body;

 const season = await Season.findById(seasonId);

 season.matches.push({ a, b, ga, gb });

 recalcSeason(season);
 await season.save();

 res.json(season);
};

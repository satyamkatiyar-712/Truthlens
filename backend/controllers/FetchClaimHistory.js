import { Factcheck } from "../models/ClaimHistory.js";

export const FindtheClaims = async (req, res) => {
  try {
    const userId = req.user.userId;
    const Factarray = await Factcheck.find({user:userId})
      .sort({isPinned:-1, createdAt: -1 })
      .limit(50)
  
    res.status(200).json({
      success: true,
      count: Factarray.length,
      data: Factarray,
    });
  } catch (error) {
    console.log("error in fetching", error);
    res.status(500).json({
      success: false,
      message: "the claims you searched before not available right now",
    });
  }
};

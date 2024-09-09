const express = require("express");
const game = require("../models/game");
const router = express.Router();

router.route("").post(async (req, res) => {
  try {
    // make entry in db
    let params = req.query;
    console.log(params);
    console.log(req.body);
    const task = await game.create(req.body);
    return res.status(200).json({
      success: true,
      body: task,
      msg: "Created new game instance.",
    });
  } catch (err) {
    console.log(`Error while createTask ${err}`);
    res.json({ success: "false", error: err });
  }
});

module.exports = router;

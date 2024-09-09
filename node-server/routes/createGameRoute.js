const express = require("express");
const { createGame } = require("../controller/createGame");
const router = express.Router();

router.route("").get((req, res) => {
  return res
    .status(200)
    .json({ success: true, msg: "get API is working fine." });
});

router.route("").post(createGame);

module.exports = router;

const express = require("express")
const router = express.Router()
// const db = require("../models")
// const { Router } = require("express")

router.get("/", (req, res) => {
    res.render("index")
})

module.exports = router
const express = require("express");
const app = express();

app.get("/", function (req, res) {
	res.send("Working React...");
});

app.listen(process.env.PORT || 8000);

const express = require("express")
const app = express()

// Port
const PORT = 8080

// app
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(express.static(__dirname + "/public"));

//handlebars
const exphbs = require("express-handlebars");
app.engine("handlebars", exphbs({ defaultLayout: "main" }));
app.set("view engine", "handlebars");

// routes
const renderRoutes = require("./controllers/render-routes.js");
app.use(renderRoutes);
const apiRoutes = require("./controllers/api-routes.js");
apiRoutes(app);

// // Sync models
// const db = require("./models")

// //Syncing sequelize models and then starting express server
// db.sequelize.sync().then(function() {
//     app.listen(PORT, function() {
//       console.log("🌎 App listening on PORT " + PORT);
//     });
// })

app.listen(PORT, function () {
      console.log("🌎 App listening on PORT " + PORT);
    });
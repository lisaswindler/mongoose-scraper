var express = require("express");
var logger = require("morgan");
var mongoose = require("mongoose");
var axios = require("axios");
var cheerio = require("cheerio");

// Require all models
var db = require("./models");

var PORT =  process.env.PORT || 3000;

// Initialize Express
var app = express();

// Configure middleware

// Use morgan logger for logging requests
app.use(logger("dev"));
// Parse request body as JSON
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
// Make public a static folder
app.use(express.static("public"));

// Set Handlebars.
var exphbs = require("express-handlebars");

app.engine("handlebars", exphbs({ defaultLayout: "main" }));
app.set("view engine", "handlebars");

// Connect to the Mongo DB
// mongoose.connect("mongodb://localhost/scraper", { useNewUrlParser: true });
var MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost/scraper";
const options = {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    family: 4
  };
mongoose.connect(MONGODB_URI,options)

// Routes
app.get("/", function (req, res) {
    res.render("index");
});
// A GET route for scraping the echoJS website
app.get("/scrape", function (req, res) {
    // First, we grab the body of the html with axios
    axios.get("https://www.sltrib.com").then(function (response) {
        // Then, we load that into cheerio and save it to $ for a shorthand selector
        var $ = cheerio.load(response.data);

        // Now, we grab every h2 within an article tag, and do the following:
        $(".slt-homepage-story").each(function (i, element) {
            // Save an empty result object
            var result = {};

            // Add the text and href of every link, and save them as properties of the result object
            result.title = $(element).find(".headline").text();
            result.image = $(element).find("a").find("img").attr("data-original");
            result.author = $(element).find(".author-container").text();
            result.link = "https://www.sltrib.com" + $(element).find("a").attr("href");

            // Create a new Article using the `result` object built from scraping
            db.Article.create(result)
                .then(function (dbArticle) {
                    // View the added result in the console
                    console.log(dbArticle);
                })
                .catch(function (err) {
                    // If an error occurred, log it
                    console.log(err);
                });
        });

        // Send a message to the client
        res.send("Scrape Complete");
    });
});

// Route for getting all Articles from the db
app.get("/articles", function (req, res) {
    // TODO: Finish the route so it grabs all of the articles
    db.Article.find().sort({_id: -1})
        .then(function (dbArticle) {
            // If all Notes are successfully found, send them back to the client
            res.json(dbArticle);
        })
        .catch(function (err) {
            // If an error occurs, send the error back to the client
            res.json(err);
        });
});

// Route for grabbing a specific Article by id, populate it with its note
app.get("/articles/:id", function (req, res) {
    // Finish the route so it finds one article using the req.params.id,
    // and run the populate method with "note",
    // then responds with the article with the note included
    db.Article.find({ _id: req.params.id })
        // Specify that we want to populate the retrieved libraries with any associated comments
        .populate("Note")
        .then(function (dbArticle) {
            // If any Libraries are found, send them to the client with any associated comments
            res.json(dbArticle);
        })
        .catch(function (err) {
            // If an error occurs, send it back to the client
            res.json(err);
        });
});

// Route for grabbing a specific Note by id
app.get("/notes/:id", function (req, res) {
    db.Note.find({ _id: req.params.id })
        .then(function (dbArticle) {
            // If any Libraries are found, send them to the client with any associated comments
            res.json(dbArticle);
        })
        .catch(function (err) {
            // If an error occurs, send it back to the client
            res.json(err);
        });
});

// Route for saving/updating an Article's associated Note
app.post("/articles/:id", function (req, res) {
    db.Note.create(req.body)
        .then(function (dbNote) {
            db.Article.findOneAndUpdate({ _id: req.params.id }, { $push: { note: dbNote._id } }, { new: true })
                .then(function (dbArticle) {
                    console.log(dbArticle);
                    res.json(dbArticle);
                })
                .catch(function (err) {
                    res.json(err);
                });
        })
        .catch(function (err) {
            res.json(err);
        })
});

//Route for deleting a note
app.delete("/notes/:id", function(req, res) {
  db.Note.deleteOne({ _id: req.params.id })
  .then(function(removed) {
    res.json(removed);
  }).catch(function(err,removed) {
        res.json(err);
    });
});

// Start the server
app.listen(PORT, function () {
    console.log("App running on port " + PORT + "!");
});

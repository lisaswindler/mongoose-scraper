// Grab the articles as a json
$.getJSON("/articles", function(data) {
  // For each one
  for (var i = 0; i < data.length; i++) {
    // Display the apropos information on the page
    var headline = "<h3><a target='_blank' href='" + data[i].link + "'>" + data[i].title + "</a></h3>";
    var newsImage = "<img class='img-fluid' src='" + data[i].image + "'>";
    var author = "<p class='author'>" + data[i].author + "</p>";
    var commentBox = "<textarea id='bodyinput' name='body' placeholder='Comment'></textarea>";
    var commentPost = "<button class='btn btn-primary' data-id='" + data[i]._id + "' id='savenote'>Post</button>";
    var commentButton = "<button class='btn btn-primary' data-id='" + data[i]._id + "' id='comments'>Show Comments</div>";
    var commentDiv = "<div id='" + data[i]._id + "'</div>";
    $("#articles").append(headline, newsImage, author, commentBox, commentPost, commentButton, commentDiv);
  }
});

$(document).on("click", "#scrape-articles", function() {
    // This function handles the user clicking the "scrape articles" button
    $.get("/scrape").then(function(data) {
    location.reload();
    });
});

// Whenever someone clicks a p tag
$(document).on("click", "#comments", function() {
  // Empty the notes from the note section
//   $("#notes").empty();
  // Save the id from the p tag
  var thisId = $(this).attr("data-id");
  // Now make an ajax call for the Article
  $.ajax({
    method: "GET",
    url: "/articles/" + thisId
  })
    // With that done, add the note information to the page
    .then(function(data) {
      console.log(data[0]);
      // The title of the article
    //   $("#notes").append("<h2>" + data.title + "</h2>");
      // An input to enter a new title
    //   $("#notes").append("<input id='titleinput' name='title' placeholder='Change Title'></input>");
      // A textarea to add a new note body
    //   $("#notes").append("<textarea id='bodyinput' name='body' placeholder='Comment'></textarea>");
      // A button to submit a new note, with the id of the article saved to it
    //   $("#notes").append("<button data-id='" + data._id + "' id='savenote'>Post</button>");

      // If there's a note in the article
      if (data[0].note) {
          console.log(data[0].note);
        // Place the title of the note in the title input
        // $("#titleinput").val(data.note.title);
        // Place the body of the note in the body textarea
        console.log(data[0].note.body);
        $("#" + thisId).append(data[0].note.body);
      }
    });
});

// When you click the savenote button
$(document).on("click", "#savenote", function() {
  // Grab the id associated with the article from the submit button
  var thisId = $(this).attr("data-id");

  // Run a POST request to change the note, using what's entered in the inputs
  $.ajax({
    method: "POST",
    url: "/articles/" + thisId,
    data: {
    //   // Value taken from title input
    //   title: $("#titleinput").val(),
      // Value taken from note textarea
      body: $("#bodyinput").val()
    }
  })
    // With that done
    .then(function(data) {
      // Log the response
      console.log(data);
      // Empty the notes section
      $("#notes").empty();
    });

  // Also, remove the values entered in the input and textarea for note entry
//   $("#titleinput").val("");
  $("#bodyinput").val("");
});

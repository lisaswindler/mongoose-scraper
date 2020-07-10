// Grab the articles as a json
$.getJSON("/articles", function (data) {
    // For each one
    for (var i = 0; i < data.length; i++) {
        // Display the apropos information on the page
        var headline = "<h3 class='pt-3'><a target='_blank' href='" + data[i].link + "'>" + data[i].title + "</a></h3>";
        var newsImage = "<img class='img-fluid' src='" + data[i].image + "'>";
        var author = "<p class='author'>" + data[i].author + "</p>";
        var commentBox = "<br><textarea class='bodyinput my-2' id='input-" + data[i]._id + "' name='body' placeholder='Comment'></textarea><br>";
        var commentPost = "<button class='btn btn-primary mr-2 savenote' data-id='" + data[i]._id + "' id='savenote'>Post</button>";
        var commentButton = "<button class='btn btn-primary' data-id='" + data[i]._id + "' id='comments'>Show Comments</button>";
        var commentDiv = "<div id='" + data[i]._id + "'></div>";
        $("#articles").append(headline, author, newsImage, commentBox, commentPost, commentButton, commentDiv);
    }
});

$(document).on("click", "#scrape-articles", function () {
    // This function handles the user clicking the "scrape articles" button
    // $("#articles").empty();
    $.get("/scrape").then(function (data) {
        location.reload();
    });
});

// Show comments
$(document).on("click", "#comments", function () {
    // Save the id
    var thisId = $(this).attr("data-id");
    // Clear the div
    $('#' + thisId).text("");
    // Now make an ajax call for the Article
    $.ajax({
        method: "GET",
        url: "/articles/" + thisId
    })
        // With that done, add the note information to the page
        .then(function (data) {
            // If there's a note in the article
            if (data[0].note) {
                for (var i = 0; i < data[0].note.length; i++) {
                    let noteId = data[0].note[i];
                    $.ajax({
                        method: "GET",
                        url: "/notes/" + noteId
                    })
                        // With that done, add the note information to the page
                        .then(function (data) {
                            console.log(data[0].body);
                            $('#' + thisId).append('<div class="pt-1">' + data[0].body + '<i class="fa fa-remove delete pl-2" id="' + noteId + '"></i></div>');
                        });
                }
            } else {
                $('#' + thisId).html("0 comments");
            }
        });
    });    

    // When you click the savenote button
    $(document).on("click", ".savenote", function () {
        // Grab the id associated with the article from the submit button
        var thisId = $(this).attr("data-id");

        // Run a POST request to change the note, using what's entered in the inputs
        $.ajax({
            method: "POST",
            url: "/articles/" + thisId,
            data: {
                // Value taken from note textarea
                body: $('#input-' + thisId).val()
            }
        })
            // With that done
            .then(function (data) {
                // Log the response
                console.log(data);
            });

        // Remove the values entered
        $('#input-' + thisId).val("");
    });

    // Delete note
    $(document).on("click", ".delete", function () {
        // Save the id
        let noteId = $(this).attr("id");
        // Now make an ajax call for the Article
        $.ajax({
            method: "DELETE",
            url: "/notes/" + noteId
        })
            .then(function (data) {
                console.log(data);
             
            });
    });
// Grab the articles as a json
$.getJSON("/articles", function (data) {
    // For each one
    for (var i = 0; i < data.length; i++) {
        // Display the apropos information on the page
        if (data[i].image) {
            var newsImage = "<img class='img-fluid' src='" + data[i].image + "'>";
        } else {
            var newsImage = "<img class='img-fluid' src='https://cdn.pixabay.com/photo/2018/06/21/16/02/cup-3488805_1280.jpg'>";
        }
        var card = "<div class='card mx-auto shadow' id='card" + [i] + "' tabindex='0'></div>"
        var headline = "<h3 class='text-left m-0 d-flex align-items-center'><a target='_blank' href='" + data[i].link + "'><i class='fa fa-newspaper-o pr-2'></i>" + data[i].title + "</a></h3><hr>";
        var author = "<p class='author'>" + data[i].author + "</p>";
        var commentBox = "<br><textarea class='bodyinput' id='input-" + data[i]._id + "' name='body' placeholder='Comment'></textarea><br>";
        var commentPost = "<button type='submit' class='btn btn-primary post-comment' data-id='" + data[i]._id + "' id='post-comment'>Post</button>";
        var commentButton = "<button class='btn btn-primary show-comments' data-id='" + data[i]._id + "'>Show Comments</button>";
        var commentDiv = "<div id='" + data[i]._id + "'></div>";
        $("#articles").append(card);
        $("#card" + [i]).append(headline, author, newsImage, commentBox, commentPost, commentButton, commentDiv);
    }
});

// This function handles the user clicking the "scrape articles" button
$(document).on("click", "#scrape-articles", function () {
    $(".fa-refresh").addClass("fa-spin");
    $("#articles").empty();
    $.get("/scrape").then(function (data) {
        location.reload();
    });
});

// Show comments
$(document).on("click", ".show-comments", function () {
    // Save the id
    var thisId = $(this).attr("data-id");
    // Clear the div
    $('#' + thisId).text("");
    $(this).html("Hide Comments");
    $(this).addClass("hide-comments");
    $(this).removeClass("show-comments");
    // Now make an ajax call for the Article
    $.ajax({
        method: "GET",
        url: "/articles/" + thisId
    })
        // With that done, add the note information to the page
        .then(function (data) {
            // If there's a comment in the article
            if (data[0].note) {
                for (var i = 0; i < data[0].note.length; i++) {
                    let noteId = data[0].note[i];
                    $.ajax({
                        method: "GET",
                        url: "/notes/" + noteId
                    })
                        // With that done, add the note information to the page
                        .then(function (data) {
                            if (data[0].body !== "undefined") {
                                $('#' + thisId).append('<div class="pt-1 comments"><i class="fa fa-remove delete float-right" data-id="' + thisId + '" id="' + noteId + '"></i>' + data[0].body + '</div>');
                            } else {
                                $('#' + thisId).html('<div class="pt-1 comments">0 comments</div>');
                            }
                        });
                }
            } else {
                $('#' + thisId).html('<div class="pt-1 comments">0 comments</div>');
            }
        });
});

// Hide comments
$(document).on("click", ".hide-comments", function () {
    var thisId = $(this).attr("data-id");
    $('#' + thisId).text("");
    $(this).html("Show Comments");
    $(this).addClass("show-comments");
    $(this).removeClass("hide-comments");
});

// Post a new comment
$(document).on("click", ".post-comment", function () {
    // Grab the id associated with the article from the submit button
    var thisId = $(this).attr("data-id");
    $('#' + thisId).text("");
    // Run a POST request to change the note, using what's entered in the inputs
    $.ajax({
        method: "POST",
        url: "/articles/" + thisId,
        data: {
            // Value taken from note textarea
            body: $('#input-' + thisId).val()
        }
    })
        .then(function (data) {
            $.ajax({
                method: "GET",
                url: "/articles/" + thisId
            })
                // With that done, add the note information to the page
                .then(function (data) {
                    for (var i = 0; i < data[0].note.length; i++) {
                        let noteId = data[0].note[i];
                        $.ajax({
                            method: "GET",
                            url: "/notes/" + noteId
                        })
                            // With that done, add the note information to the page
                            .then(function (data) {
                                $('#' + thisId).append('<div class="pt-1 comments"><i class="fa fa-remove delete float-right" data-id="' + thisId + '" id="' + noteId + '"></i>' + data[0].body + '</div>');
                            });
                    }
                });
        });
    // Remove the values entered
    $('#input-' + thisId).val("");
});

// Delete note
$(document).on("click", ".delete", function () {
    // Save the id
    let noteId = $(this).attr("id");
    let parentId = $(this).attr("data-id");
    $('#' + parentId).html("");
    // Now make an ajax call for the comment
    $.ajax({
        method: "DELETE",
        url: "/notes/" + noteId
    })
        .then(function (data) {
            $.ajax({
                method: "DELETE",
                url: "/articles/" + parentId,
                note: JSON.stringify(noteId)
            })
                .then(function (data) {
                    // When comment is deleted, refresh the dom with a new ajax call
                    $.ajax({
                        method: "GET",
                        url: "/articles/" + parentId
                    })
                        .then(function (data) {
                            if (data[0].note) {
                                for (var i = 0; i < data[0].note.length; i++) {
                                    let noteId = data[0].note[i];
                                    $.ajax({
                                        method: "GET",
                                        url: "/notes/" + noteId
                                    })
                                        // With that done, add the note information to the page
                                        .then(function (data) {
                                            if (data[0].body) {
                                                $('#' + parentId).append('<div class="pt-1 comments"><i class="fa fa-remove delete float-right" data-id="' + parentId + '" id="' + noteId + '"></i>' + data[0].body + '</div>');
                                            }
                                        });
                                }
                            } else {
                                $('#' + parentId).html('<div class="pt-1 comments">0 comments</div>');
                            }
                        });
                });
        });
});
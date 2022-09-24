var express = require('express');
var router = express.Router();

const categories = require("../data/categories");
const get_photos = require("../utils/utils");


// GET portfolio listing.
router.get("/", function (req, res, next) {
    // Render the error page
    res.status(404);
    res.render("error", {title: "Error", message: "Not Found", error: {status: 404}});
});

router.get("/:category", function (req, res, next) {
    console.log("Portfolio category: " + req.params.category);

    let category_data = get_photos(categories, req.params.category);
    if (category_data) {
        res.render("portfolio", {title: req.params.category, data: category_data.featured});
        return;
    }

    res.status(404);
    res.render("error", {
        title: "Error",
        message: "Not Found: '" + req.params.category + "' category.",
        error: {status: 404}
    });
});

router.get('/:category/:album', function (req, res, next) {
    console.log("Portfolio category: " + req.params.category + " album: " + req.params.album);

    let category_data = get_photos(categories, req.params.category);
    if (category_data === undefined) {
        res.status(404);
        // Render the error page
        res.render("error", {
            title: "Error",
            message: "Not Found: '" + req.params.category + "' category.",
            error: {status: 404}
        });
        return;
    }

    let album_data = get_photos(category_data, req.params.album, true);
    if (album_data !== undefined) {
        res.render("portfolio", {title: req.params.album, data: album_data.photos});
        return;
    }

    // Render the error page
    res.status(404);
    res.render("error", {
        title: "Error",
        message: "Not Found: " + req.params.category + "'s album: '" + req.params.album + "'",
        error: {status: 404}
    });
});

module.exports = router;

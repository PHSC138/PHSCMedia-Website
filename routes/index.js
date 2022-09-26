var express = require('express');
var router = express.Router();

const crypto = require("crypto");
const fs = require('fs');

const categories = require("../data/categories");
const get_photos = require("../utils/utils");

// GET home page.
router.get('/', function (req, res, next) {
    // Get featured photo
    // Monkey
    // let feature = get_photos(get_photos(categories, "Longboarding"), "Maryhill RVOD 2021", true).photos[473];
    // Panning maryhill
    let feature = get_photos(get_photos(categories, "Longboarding"), "Maryhill RVOD 2021", true).photos[534];

    res.render('index', {feature_photo: feature});
});

router.get('/about', function (req, res, next) {
    console.log("About");

    res.render('about', {title: 'About'});
});

function is_authorized(req) {
    // Authorization is customish
    // Client hashes username:password with sha256, then sends to server
    // Server will hash again with a salt and compare to precomputed (doubly sha256 hashed value)
    let authorization = req.get("Token");

    if (authorization === undefined) {
        return false;
    }

    const salt = "PHSCMEDIALIKESHOTSAUCE";

    authorization = salt + authorization;

    // Create a sha-256 hasher
    const sha256_key = require("../data/keys");

    const sha256Hasher = crypto.createHmac("sha256", sha256_key);

    // Hash the string and set the output format
    const hash = sha256Hasher.update(authorization).digest("hex");

    // Compare with precomputed value
    return hash === "96cff57d34909575412aeef57a5208f02bad8931c98c9c88f5ae6e15cf46d9ef";
}

// Allow links to be updated -- most recent 5 are displayed && kept
router.put('/links', function (req, res, next) {
    console.log("Put links");

    // Check authorization
    if (!is_authorized(req)) {
        res.status(403).render("error", {title: "Error", message: "Forbidden", error: {status: 403}});
        return;
    }

    // Check data
    let data = req.body;

    if (!data.hasOwnProperty('link') || !data.hasOwnProperty('preview') || !data.hasOwnProperty('text')) {
        // Missing required key
        res.status(400).render("error", {title: "Error", message: "Bad request", error: {status: 400}});
        return;
    }

    // Optional positional argument
    if (!data.hasOwnProperty('position')) {
        // Push data to front
        req.app.locals.link_data.push(data);
    } else {
        // Use position as index
        let position = parseInt(data.position);

        // Check for actual number
        if (position === Nan) {
            res.status(400).render("error", {title: "Error", message: "Bad request", error: {status: 400}});
            return;
        }

        // Check position is in range of array
        if (position >= req.app.locals.link_data.length) {
            res.status(400).render("error", {title: "Error", message: "Bad request", error: {status: 400}});
            return;
        }

        // Don't have to store position
        delete data.position;

        req.app.locals.link_data[position] = data;
    }

    if (req.app.locals.link_data.length > 5) {
        // Shift removes first element and shifts other elements up
        req.app.locals.link_data.shift();
    }

    res.send({status: 'OK'});

    // Store the updates in .json file
    // Do this after response is sent
    fs.writeFileSync("data/links.json", JSON.stringify(req.app.locals.link_data));
});

router.get('/links', function (req, res, next) {
    console.log("Get links");

    // Check authorization
    if (is_authorized(req)) {
        let json_export = [];
        let url_prefix = "https://www.phsc138.com/portfolio/";

        for (let i = 0; i < categories.length; i++) {
            let category = {};
            category.title = categories[i].text;
            category.photos = [];
            for (let j = 0; j < categories[i].albums.length; j++) {
                category.photos.push(url_prefix + categories[i].albums[j].text);
            }

            json_export.push(category);
        }

        res.send(JSON.stringify(json_export, null, 4));
        return;
    }

    // NOTE: pug can access locals directly!!!
    // Found by iterating link_data directly in links template
    res.render('links', {title: 'Links', links: [...req.app.locals.link_data].reverse()});
});

module.exports = router;
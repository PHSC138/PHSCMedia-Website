function get_photos(category_data, text, album = false) {
    if (album) category_data = category_data.albums;

    for (let i = 0; i < category_data.length; i++) {
        // TODO: remove debug messages or in debug mode?
        // console.log("Text: " + category_data[i].text)
        if (text === category_data[i].text) {
            // console.log("Returning: " + JSON.stringify(category_data[i]));
            return category_data[i];
        }
    }
    return undefined;
}

module.exports = get_photos;

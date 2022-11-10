// Global for closing modal
let open = false;
let transitioning = false;


function disableScroll() {
    document.body.classList.add("stop-scrolling");
}

function enableScroll() {
    document.body.classList.remove("stop-scrolling");
}

function openModal() {
    transitioning = true;
    disableScroll();
    document.getElementById("modal").classList.add("active");
}

function modalIsOpen() {
    return open && document.getElementById("modal").classList.contains("active");
}

function closeModal() {
    open = false;
    enableScroll();
    document.getElementById("modal").classList.remove("active");
}

function plusSlides(n) {
    showSlides(slideIndex += n);
}

function currentSlide(n) {
    showSlides(slideIndex = n);
}

function showSlides(n) {
    var i;
    var slides = document.getElementsByClassName("slides");
    if (slides === undefined || slides.length < 1) return;

    if (n > slides.length) {
        // Right got to end of slides
        slideIndex = 1
    } else if (n < 1) {
        // Left arrow got to beginning of slides
        slideIndex = slides.length
    } else {
        // Update global
        slideIndex = n;
    }

    for (i = 0; i < slides.length; i++) {
        slides[i].style.display = "none";
    }

    slides[slideIndex - 1].style.display = "block";

    let download = document.getElementById("download_a");
    let children = slides[slideIndex - 1].children;
    let fullsize_path;
    if (children[0].nodeName === "IMG") {
        fullsize_path = children[0].getAttribute("download_src");
        children[0].loading = "eager"
    } else {
        fullsize_path = children[1].getAttribute("download_src");
        children[1].loading = "eager"
    }


    // Path to image file
    download.href = fullsize_path;

    // Downloaded file name
    download.download = fullsize_path.split('/').reverse()[0];

    // Update count caption
    document.getElementById("img_count").innerText = "" + (slideIndex + 1) + " / " + slides.length;
}

function outside_dimensions(dimensions, start_x, start_y, end_x, end_y) {
    // Calculates if click is outside an object's dimensions
    if (end_x === undefined && end_y === undefined) {
        return (
            (start_x < dimensions.left) // Clicked to the left of the object
            || (start_x > dimensions.right) // Clicked to the right of the object
            || (start_y < dimensions.top) // Clicked above the object
            || (start_y > dimensions.bottom) // Clicked below the object
        );
    } else {
        return (
            (start_x < dimensions.left && end_x < dimensions.left) // Clicked to the left of the object
            || (start_x > dimensions.right && end_x > dimensions.right) // Clicked to the right of the object
            || (start_y < dimensions.top && end_y < dimensions.top) // Clicked above the object
            || (start_y > dimensions.bottom && end_y > dimensions.bottom) // Clicked below the object
        );
    }
}

function check_outside_interaction(start_x, start_y, end_x, end_y) {
    // end_x and end_y can be undefined
    // Touch was outside the modal picture, should close lightbox
    let active_slide = document.querySelector("div.slides[style='display: block;']");
    let left_control = document.querySelector(".prev");
    let right_control = document.querySelector(".next");
    let close_control = document.querySelector("#close");
    let download_control = document.querySelector("#download");

    if (outside_dimensions(active_slide.getBoundingClientRect(), start_x, start_y, end_x, end_y)
        && outside_dimensions(left_control.getBoundingClientRect(), start_x, start_y, end_x, end_y)
        && outside_dimensions(right_control.getBoundingClientRect(), start_x, start_y, end_x, end_y)
        && outside_dimensions(close_control.getBoundingClientRect(), start_x, start_y, end_x, end_y)
        && outside_dimensions(download_control.getBoundingClientRect(), start_x, start_y, end_x, end_y)
    ) {
        // Close modal
        closeModal();
    }
}


var slideIndex = 1;
showSlides(slideIndex);

// Close modal with esc character
window.addEventListener("keydown", (event) => {
    if (modalIsOpen()) {
        switch (event.key) {
            case "Escape":
                closeModal();
                break;
            case "ArrowLeft":
                showSlides(slideIndex - 1);
                break;
            case "ArrowRight":
                showSlides(slideIndex + 1);
                break;
        }
    }
}, true);

// Handle left and right swipes
var swipe_start_x = null;
var swipe_start_y = null;
window.addEventListener("touchstart", function (event) {
    if (modalIsOpen() && event.touches.length === 1) {
        // Just one finger touched
        swipe_start_x = event.touches.item(0).clientX;
        swipe_start_y = event.touches.item(0).clientY;
    } else {
        // A second finger hit the screen, abort the touch
        swipe_start_x = null;
    }
});

window.addEventListener("touchend", function (event) {
    // Horizontal distance of at least 100px is a swipe
    var offset = 100;
    if (modalIsOpen() && swipe_start_x !== null && swipe_start_y !== null) {
        // The only finger that hit the screen left it
        var swipe_end_x = event.changedTouches.item(0).clientX;
        var swipe_end_y = event.changedTouches.item(0).clientY;

        // Check for vertical offset
        if (Math.abs(swipe_start_y - swipe_end_y) > 200) {
            // Just a scroll with a delta of 200px?
            return;
        }

        if (swipe_end_x > swipe_start_x + offset) {
            // left -> right swipe
            showSlides(slideIndex - 1);
        } else if (swipe_end_x < swipe_start_x - offset) {
            // left <- right swipe
            showSlides(slideIndex + 1);
        }
    }
});

window.addEventListener("transitionend", function (event) {
    // Have to make sure modal is transitioned in before allowing a click outside the image area to close it
    if (event.target.id === "modal") {
        if (transitioning) {
            transitioning = false;
            open = true;
        }
    }
});

window.addEventListener("click", function (event) {
    if (modalIsOpen()) {
        check_outside_interaction(event.clientX, event.clientY);
    }
});


// Loading bar until at least thumbnails are loaded
// This prevents gross flashing loading
var num_images = undefined;
var loaded = 0;
var container = undefined;
var progress_bar = undefined;
function checkLoaded() {
    // Get container
    if (num_images === undefined) {
        container = document.getElementsByClassName("portfolio-masonry-container")[0];
        num_images = container.getAttribute("images");
        progress_bar = document.getElementById("progress-bar");
    }

    // Loaded another image
    loaded += 1;

    // Update progress bar
    const percentage = Math.floor(loaded / num_images * 100);
    progress_bar.style.width = percentage + "%";

    // Check if all thumbnails have loaded
    if (loaded === num_images - 1) {
        container.style.display = "block"; 
        progress_bar.style.display = "none";
    }
}
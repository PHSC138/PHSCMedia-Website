document.addEventListener("DOMContentLoaded", function () {
    let drop_buttons = document.getElementsByClassName("dropbtn");
    for (let i = 0; i < drop_buttons.length; i++) {
        drop_buttons[i].addEventListener("click", function (event) {

            let dropdown = this.parentNode.children;
            if (dropdown[0].tagName === "DIV") dropdown = dropdown[0]
            else dropdown = dropdown[1];

            if (dropdown.classList.contains("display")) {
                dropdown.classList.remove("display");
                dropdown.classList.add("none");
            } else {
                dropdown.classList.remove("none");
                dropdown.classList.add("display");
            }
        });
    }
});
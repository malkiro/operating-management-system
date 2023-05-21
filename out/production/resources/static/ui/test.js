window.addEventListener('load',test);
function test() {

}

function printMC() {
    var newwindow = window.open();
    newwindow.document.write("<div>empprintview.outerHTML</div>");
    newwindow.print();
}
window.getWindowDimensions = function () {
    return {
        width: window.innerWidth,
        height: window.innerHeight
    };
};

function makeDialogDraggable(dialogId) {
    var dialogElement = document.getElementById(dialogId);
    if (dialogElement) {
        dialogElement.style.position = 'absolute';
        dialogElement.style.cursor = 'move';
        dialogElement.onmousedown = function(event) {
            dialogElement.style.left = (dialogElement.offsetLeft - event.clientX) + 'px';
            dialogElement.style.top = (dialogElement.offsetTop - event.clientY) + 'px';
            document.onmousemove = function(event) {
                dialogElement.style.left = (event.clientX + dialogElement.offsetLeft) + 'px';
                dialogElement.style.top = (event.clientY + dialogElement.offsetTop) + 'px';
            }
            document.onmouseup = function() {
                document.onmousemove = null;
            }
        }
    }
}
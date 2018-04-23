let tLast = new Date().getTime();
function beat() {
    let tNow = new Date().getTime();
    let freq = (tNow - tLast) / 1000;
    tLast = tNow;
    addIPI(freq);
    // TODO: Freq should be inverted.
}

function onMouseDown(evt) {
    beat();
}

function onTouchStart(evt) {
    evt.preventDefault();
    beat();
}
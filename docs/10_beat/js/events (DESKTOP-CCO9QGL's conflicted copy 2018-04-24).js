let tLast = new Date().getTime();
function beat() {
    let tNow = new Date().getTime();
    let freq = 60000 / (tNow - tLast);
    tLast = tNow;
    console.log(freq);
    addIPI(freq, a0);
    console.log(F.max());
}

function onMouseDown(evt) {
    beat();
}

function onTouchStart(evt) {
    evt.preventDefault();
    beat();
}
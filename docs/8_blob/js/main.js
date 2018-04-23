// List of shader source file names
const shaderFiles = [
    'quad.frag',
    'quad.vert',
    'crystal.frag'
];
let shaderSources = {};

let canvas;
let canvasScale = 0.33;
let cWidth;
let cHeight;
let screenInverse = new THREE.Vector2(0, 0);
let screenSize = new THREE.Vector2(0, 0);
let aspectRatio = window.innerHeight / window.innerWidth;

let renderer;

let quadGeometry;

let mousePositionNow = new THREE.Vector2(0.5, 0.5);
let mousePositionLast = new THREE.Vector2(0.5, 0.5);
let clicked = false;
let mouseRadius = 0.008;
let mouseStrength = 0.8 / 60;
let mouseAttributes = new THREE.Vector4(clicked, mouseRadius, mouseStrength, 0);

let attractorPosition = new THREE.Vector2(0.5, 0.5);
let attractorVelocity = new THREE.Vector2(0., 0.);

let ticksSinceMotion = 0;

let mainScene;
let mainCamera;
let mainMaterial;
let mainMesh;
let mainUniforms = {
    t: {value: 0},
    screenInverse: {value: screenInverse},
    attractorPosition: {value: attractorPosition},
    mousePosition: {value: mousePositionNow},
    aspectRatio: {value: aspectRatio},
    ticksSinceMotion: {value: ticksSinceMotion},
    data: {value: null}
};

let computer;

let crystalScale = 1.;
let crystalUniforms = {
    t: {value: 0},
    screenInverse: {value: screenInverse.multiplyScalar(crystalScale)},
    screenSize: {value: screenSize.multiplyScalar(crystalScale)},
    mousePosition: {value: mousePositionNow},
    mouseAttributes: {value: mouseAttributes},
    aspectRatio: {value: aspectRatio}
};


$(document).ready(function() {
    loadFiles().then(main);
});


function main() {

    setupGUI();

    canvas = document.getElementById('canvas');
    $(window).mousemove(onMouseMove);
    $(window).mousedown(onMouseDown);
    $(window).mouseup(onMouseUp);
    $(window).resize(resize);
    window.addEventListener('touchstart', onTouchStart, false);
    window.addEventListener('touchmove', onTouchMove, false);
    window.addEventListener('touchend', onTouchEnd, false);

    restart();
}


/**
 * Setup the GUI.
 */
function setupGUI() {
    // stats = new Stats();
    // stats.showPanel(0);
    // document.body.appendChild(stats.domElement);
}


function resize() {
    cWidth = Math.floor(canvasScale * window.innerWidth);
    cHeight = Math.floor(canvasScale * window.innerHeight);
    screenInverse.x = 1 / cWidth;
    screenInverse.y = 1 / cHeight;
    screenSize.x = cWidth;
    screenSize.y = cHeight;
    canvas.width = cWidth;
    canvas.height = cHeight;
    aspectRatio = window.innerHeight / window.innerWidth;

    if (mainCamera) {
        mainCamera.aspect = cWidth / cHeight;
    }
}


/**
 * Restart the sketch.
 */
function restart() {

    resize();

    if (mainCamera) {
        mainCamera.aspect = cWidth / cHeight;
    }

    // Setup WebGL structures
    setupGL();

    // Animate the sketch
    animate();
}


function setupGL() {
    renderer = new THREE.WebGLRenderer({
        canvas: canvas,
        antialias: false});
    renderer.autoClear = false;

    setupComputer();

    // Create a simple quad geometry
    quadGeometry = new THREE.BufferGeometry();
    let positions = [
        -1, -1, 0,
         1, -1, 0,
        -1, 1, 0,
         1, 1, 0,
        -1, 1, 0,
         1, -1, 0
    ];
    let positionAttribute = new THREE.Float32BufferAttribute(positions, 3);
    quadGeometry.addAttribute('position', positionAttribute);

    mainScene = new THREE.Scene();
    mainCamera = new THREE.PerspectiveCamera(
        60,
        cWidth / cHeight,
        1,
        1000);
    mainScene.add(mainCamera);
    mainMaterial = new THREE.RawShaderMaterial({
        vertexShader: shaderSources['quad.vert'],
        fragmentShader: shaderSources['quad.frag'],
        uniforms: mainUniforms
    });
    mainMesh = new THREE.Mesh(quadGeometry, mainMaterial);
    mainScene.add(mainMesh);
}


function animate() {
    requestAnimationFrame(animate);

    //console.time('update');
    update();
    //console.timeEnd('update');

    //console.time('render');
    render();
    //console.timeEnd('render');


}


let startTime = new Date().getTime();
let lastTime = startTime;
let thisTime;
let elapsedTime;
let attractorTarget;
function update() {
    thisTime = new Date().getTime();
    elapsedTime = thisTime - lastTime;
    lastTime = thisTime;

    updateAttractor();

    mainUniforms.t.value += elapsedTime / 1000;
    mainUniforms.screenInverse.value = screenInverse;
    mainUniforms.attractorPosition.value = attractorPosition;
    mainUniforms.mousePosition.value = mousePositionNow;
    mainUniforms.aspectRatio.value = aspectRatio;
    mainUniforms.ticksSinceMotion.value = ticksSinceMotion;
    mainUniforms.data.value = computer.currentRenderTarget('data').texture;

    crystalUniforms.t.value += elapsedTime / 1000;
    crystalUniforms.screenInverse.value = screenInverse.multiplyScalar(crystalScale);
    crystalUniforms.screenSize.value = screenSize.multiplyScalar(crystalScale);
    crystalUniforms.mousePosition.value = mousePositionNow;
    crystalUniforms.aspectRatio.value = aspectRatio;

    mouseAttributes.set(clicked, mouseRadius, mouseStrength, 0.);
    crystalUniforms.mouseAttributes.value = mouseAttributes;
}


function updateAttractor() {
    let mouseMoved = updateMouse();

    if (mouseMoved) {
        ticksSinceMotion = 0;
    }
    else {
        ticksSinceMotion += 1;
    }

    attractorTarget = mousePositionNow;

    let dAttractorX = attractorPosition.x - attractorTarget.x;
    let dAttractorY = attractorPosition.y - attractorTarget.y;
    let vx = 0.95 * attractorVelocity.x - 0.000035 * dAttractorX;
    let vy = 0.95 * attractorVelocity.y - 0.000035 * dAttractorY;
    attractorVelocity.set(vx, vy);

    let px = Math.max(0, Math.min(1,
        attractorPosition.x + elapsedTime * attractorVelocity.x));
    let py = Math.max(0, Math.min(1,
        attractorPosition.y + elapsedTime * attractorVelocity.y));
    attractorPosition.set(px, py);
}


function updateMouse() {
    let mouseMoved = false;
    let dMouseX = mousePositionNow.x - mousePositionLast.x;
    let dMouseY = mousePositionNow.y - mousePositionLast.y;
    if (dMouseX !== 0 || dMouseY !== 0) {
        mouseMoved = true;
    }
    mousePositionLast.x = mousePositionNow.x;
    mousePositionLast.y = mousePositionNow.y;

    return mouseMoved;
}

let ticks = 0;
function render() {
    if (ticks % 1 === 0) {
        computer.compute();
    }
    ticks += 1;

    renderer.setSize(cWidth, cHeight);
    // renderer.clear();
    renderer.render(mainScene, mainCamera);

}


function setupComputer() {
    computer = new ComputeRenderer(renderer);

    computer.addVariable(
        'data',
        shaderSources['crystal.frag'],
        crystalUniforms,
        initCrystal,
        Math.round(crystalScale * cWidth),
        Math.round(crystalScale * cHeight),
        THREE.NearestFilter,
        THREE.NearestFilter
    );

    computer.setVariableDependencies('data', ['data']);

    let initStatus = computer.init();
    if (initStatus !== null) {
        console.log(initStatus);
    }
}


function initCrystal(texture) {
    // Zero init
    let data = texture.image.data;
    for (let i = 0; i < data.length; i++) {
        data[i] = 0;
    }
}


/**
 * Load GLSL shader source code into strings.
 * @returns {*}
 */
function loadFiles() {
    return $.when.apply($, shaderFiles.map(loadFile));
}
function loadFile(fileName) {
    let fullName = './glsl/' + fileName;
    return $.ajax(fullName).then(function(data) {
        shaderSources[fileName] = data;
    });
}

import Detector from './Detector.js';

// List of shader source file names
const shaderFiles = [
    'quad.frag',
    'quad.vert',
    'feedback.frag'
];
let shaderSources = {};

let canvas;
let canvasScale = 1.;
let cWidth;
let cHeight;
let screenInverse = new THREE.Vector2(0, 0);
let screenSize = new THREE.Vector2(0, 0);

let renderer;

let quadGeometry;

let mousePositionNow = new THREE.Vector2(0, 0);
let mousePositionLast = new THREE.Vector2(-1, -1);

let mainScene;
let mainCamera;
let mainMaterial;
let mainMesh;
let mainUniforms = {
    t: {value: 0},
    screenInverse: {value: screenInverse},
    mousePositionNow: {value: mousePositionNow},
    aspectRatio: {value: window.innerHeight / window.innerWidth}
};


$(document).ready(function() {
    loadFiles().then(main);
});


/**
 * Sketch on ready function.
 */
function main() {
    if (!Detector.webgl) Detector.addGetWebGLMessage();

    setupGUI();

    canvas = document.getElementById('canvas');
    $(window).mousemove(onMouseMove);
    $(window).resize(resize);
    window.addEventListener('touchstart', onTouchStart, false);
    window.addEventListener('touchmove', onTouchMove, false);

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

    // setupComputer();

    // Create a simple quad geometry
    quadGeometry = new THREE.BufferGeometry();
    let positions = [
        -1, -1, 0,
         1, -1, 0,
        -1, 1, 0,
         1, 1, 0,
        -1, 1, 0,
         1, -1, 0,
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

    updateMouse();
}


function updateMouse() {
    mousePositionLast.x = mousePositionNow.x;
    mousePositionLast.y = mousePositionNow.y;
}


let startTime = new Date().getTime();
let lastTime = startTime;
let thisTime;
let elapsedTime;
function update() {
    thisTime = new Date().getTime();
    elapsedTime = thisTime - lastTime;
    lastTime = thisTime;

    mainUniforms.t.value += elapsedTime / 1000;
    mainUniforms.screenInverse.value = screenInverse;
    mainUniforms.mousePositionNow.value = mousePositionNow;
    mainUniforms.aspectRatio.value = window.innerHeight / window.innerWidth;
}


function render() {

    renderer.setSize(cWidth, cHeight);
    renderer.clear();
    renderer.render(mainScene, mainCamera);
}


function onMouseMove(evt) {
    let e = evt.originalEvent;
    let x = canvasScale * e.clientX * screenInverse.x;
    let y = 1. - canvasScale * e.clientY * screenInverse.y;
    mousePositionNow.set(x, y);
}


function onTouchStart(evt) {
    evt.preventDefault();
    let touch = evt.touches[0];
    let x = canvasScale * touch.clientX * screenInverse.x;
    let y = 1. - canvasScale * touch.clientY * screenInverse.y;
    mousePositionNow.set(x, y);
}

function onTouchMove(evt) {
    onTouchStart(evt);
}


/**
 * Load GLSL shader source code into strings.
 * @returns {*}
 */
function loadFiles() {
    return $.when.apply($, shaderFiles.map(loadFile));
}
function loadFile(fileName) {
    let fullName = 'glsl/' + fileName;
    return $.ajax(fullName).then(function(data) {
        shaderSources[fileName] = data;
    });
}

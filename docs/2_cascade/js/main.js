import ComputeRenderer from './ComputeRenderer.js';
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
let computer;

let quadGeo;

let mainScene;
let mainCamera;
let mainMaterial;
let mainMesh;
let mainUniforms = {
    t: {value: 0},
    screenInverse: {value: screenInverse},
    texture: {value: null}
};

let mousePositionNow = new THREE.Vector2(0, 0);
let mousePositionLast = new THREE.Vector2(-1, -1);

let cDecay = 0.999;

let feedbackUniforms = {
    screenInverse: {value: screenInverse},
    mousePositionLast: {value: mousePositionLast},
    mousePositionNow: {value: mousePositionNow},
    cDecay: {value: cDecay}
};

let stats;

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
    let jCanvas = $('#canvas');
    jCanvas.mousemove(onMouseMove);
    $(window).resize(restart);

    restart();
}


/**
 * Setup the GUI.
 */
function setupGUI() {
    stats = new Stats();
    stats.showPanel(0);
    document.body.appendChild(stats.domElement);
}


/**
 * Restart the sketch.
 */
function restart() {
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

    // Setup WebGL structures
    setupGL();

    // Animate the sketch
    animate();

}


function setupGL() {
    renderer = new THREE.WebGLRenderer({
        canvas: canvas,
        antialias: false});
    renderer.autoClearColor = false;

    setupComputer();

    quadGeo = new THREE.PlaneGeometry(2, 2);

    mainScene = new THREE.Scene();
    mainCamera = new THREE.PerspectiveCamera(
        60,
        cWidth / cHeight,
        1,
        1000);
    mainScene.add(mainCamera);
    mainMaterial = new THREE.ShaderMaterial({
        vertexShader: shaderSources['quad.vert'],
        fragmentShader: shaderSources['quad.frag'],
        uniforms: mainUniforms
    });
    mainMesh = new THREE.Mesh(quadGeo, mainMaterial);
    mainScene.add(mainMesh);
}


function animate() {
    requestAnimationFrame(animate);

    update();
    render();

    mousePositionLast.x = mousePositionNow.x;
    mousePositionLast.y = mousePositionNow.y;

    stats.update();
}


function setupComputer() {
    computer = new ComputeRenderer(renderer);

    computer.addVariable(
        'field',
        shaderSources['feedback.frag'],
        feedbackUniforms,
        initField,
        cWidth,
        cHeight,
        THREE.LinearFilter,
        THREE.LinearFilter
    );

    computer.setVariableDependencies('field', ['field']);

    let initStatus = computer.init();
    if (initStatus !== null) {
        console.log(initStatus);
    }
}


let startTime = new Date().getTime();
let lastTime = startTime;
let thisTime;
let elapsedTime;
function update() {
    feedbackUniforms.screenInverse.value = screenInverse;
    feedbackUniforms.mousePositionLast.value = mousePositionLast;
    feedbackUniforms.mousePositionNow.value = mousePositionNow;
    feedbackUniforms.cDecay.value = cDecay;

    thisTime = new Date().getTime();
    elapsedTime = thisTime - lastTime;
    lastTime = thisTime;

    mainUniforms.t.value += elapsedTime / 1000;
    mainUniforms.screenInverse.value = screenInverse;
    mainUniforms.texture.value = computer.currentRenderTarget('field').texture;
}


function render() {
    computer.compute();

    renderer.setSize(cWidth, cHeight);
    renderer.clear();
    renderer.render(mainScene, mainCamera);
}


function initField(texture) {
    let data = texture.image.data;
    for (let i = 0; i < data.length; i++) {
        data[i] = 0;
    }
}


function onMouseMove(evt) {
    mousePositionNow.x = canvasScale * evt.clientX * screenInverse[0];
    mousePositionNow.y = 1. - canvasScale * evt.clientY * screenInverse[1];
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

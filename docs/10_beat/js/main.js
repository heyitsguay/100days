let ipis = [];
let a0 = 1.;
let c = 0.99;
let s = 8;
let threshold = 0.0005;
let modeInfo = [0., 0., 0., 0.];

let fMax = 256;
let F = new Float32Array(fMax);
let dF = new Float32Array(fMax);

function addIPI(freq, a) {
    // Round to nearest integer frequency
    let freqi = Math.round(freq);
    let fmin = freqi - 5;
    let fmax = freqi + 5;
    for (let f = fmin; f <= fmax; f++) {
        F[f] += a * Math.exp(-s * (f - freq) * (f - freq));
        if (f > 0) {
            dF[f] = Math.sign(F[f] - F[f - 1]);
        }
    }
}

function updateF() {

}

function updateIPIs() {
    // Track which old IPIs to remove
    let removeIdxs = [];
    // Iterate through IPIs
    for (let i in ipis) {
        let ipi = ipis[i];
        // If IPI i's amplitude is less than the threshold, mark
        // the IPI index for removal
        if (ipi[1] < threshold) {
            removeIdxs.push(i);
        } else {
            // Else decay the amplitude. TODO: Value-dependent decay
            ipi[1] *= c;
        }
    }
    for (let idx of removeIdxs) {
        ipis.splice(idx, 1);
    }
}

function updateFold() {
    // Iterate through frequencies
    for (let i = 0; i < fMax; ++i) {
        // Iterate through IPIs, update F
        for (let ipi of ipis) {
            let f = ipi[0];
            let a = ipi[1];
            F[i] += a * Math.exp(s * (i - f) * (i - f));
        }
        // Update dF
        if (i === 0) {
            dF[i] = 0;
        } else {
            dF[i] = F[i] - F[i - 1];
        }
        // Update modeInfo
        if (i > 0) {
            if (dF[i] <= 0 && dF[i - 1] > 0) {
                let mode = i - 1;
                let Fmode = F[mode];
                if (Fmode > modeInfo[1]) {
                    modeInfo[0] = mode;
                    modeInfo[1] = Fmode;
                }
                else if (Fmode > modeInfo[3]) {
                    modeInfo[2] = mode;
                    modeInfo[3] = Fmode;
                }
            }
        }
    }
}

// List of shader source file names
const shaderFiles = [
    'quad.frag',
    'quad.vert',
    'beat.frag'
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


let mainScene;
let mainCamera;
let mainMaterial;
let mainMesh;
let mainUniforms = {
    t: {value: 0},
    screenInverse: {value: screenInverse},
    aspectRatio: {value: window.innerHeight / window.innerWidth},
    field: {value: null}
};

let computer;

let fieldUniforms = {
    aspectRatio: {value: window.innerHeight / window.innerWidth},
    screenInverse: {value: screenInverse},
};


$(document).ready(function() {
    test();
    // loadFiles().then(main);
});

function test() {
    let trace1 = {
        x: [1, 2, 3, 4],
        y: [10, 15, 13, 17],
        type: 'scatter'
    };
    let trace2 = {
        x: [1, 2, 3, 4],
        y: [16, 5, 11, 9],
        type: 'scatter'
    };
    let data = [trace1, trace2];
    Plotly.newPlot('plot', data);
}
//
//
// /**
//  * Sketch on ready function.
//  */
// function main() {
//
//     setupGUI();
//
//     canvas = document.getElementById('canvas');
//     $(window).mousedown(onMouseDown);
//     $(window).resize(resize);
//     window.addEventListener('touchstart', onTouchStart, false);
//     restart();
// }
//
//
// /**
//  * Setup the GUI.
//  */
// function setupGUI() {
//     // stats = new Stats();
//     // stats.showPanel(0);
//     // document.body.appendChild(stats.domElement);
// }
//
//
// function resize() {
//     cWidth = Math.floor(canvasScale * window.innerWidth);
//     cHeight = Math.floor(canvasScale * window.innerHeight);
//     screenInverse.x = 1 / cWidth;
//     screenInverse.y = 1 / cHeight;
//     screenSize.x = cWidth;
//     screenSize.y = cHeight;
//     canvas.width = cWidth;
//     canvas.height = cHeight;
//
//     if (mainCamera) {
//         mainCamera.aspect = cWidth / cHeight;
//     }
// }
//
//
// /**
//  * Restart the sketch.
//  */
// function restart() {
//
//     resize();
//
//     if (mainCamera) {
//         mainCamera.aspect = cWidth / cHeight;
//     }
//
//     // Setup WebGL structures
//     setupGL();
//
//     // Animate the sketch
//     animate();
// }
//
//
// function setupGL() {
//     renderer = new THREE.WebGLRenderer({
//         canvas: canvas,
//         antialias: false});
//     renderer.autoClear = false;
//
//     setupComputer();
//
//     // Create a simple quad geometry
//     quadGeometry = new THREE.BufferGeometry();
//     let positions = [
//         -1, -1, 0,
//          1, -1, 0,
//         -1, 1, 0,
//          1, 1, 0,
//         -1, 1, 0,
//          1, -1, 0
//     ];
//     let positionAttribute = new THREE.Float32BufferAttribute(positions, 3);
//     quadGeometry.addAttribute('position', positionAttribute);
//
//     mainScene = new THREE.Scene();
//     mainCamera = new THREE.PerspectiveCamera(
//         60,
//         cWidth / cHeight,
//         1,
//         1000);
//     mainScene.add(mainCamera);
//     mainMaterial = new THREE.RawShaderMaterial({
//         vertexShader: shaderSources['quad.vert'],
//         fragmentShader: shaderSources['quad.frag'],
//         uniforms: mainUniforms
//     });
//     mainMesh = new THREE.Mesh(quadGeometry, mainMaterial);
//     mainScene.add(mainMesh);
// }
//
//
// function animate() {
//     requestAnimationFrame(animate);
//
//     //console.time('update');
//     update();
//     //console.timeEnd('update');
//
//     //console.time('render');
//     render();
//     //console.timeEnd('render');
//
//
// }
//
//
// let startTime = new Date().getTime();
// let lastTime = startTime;
// let thisTime;
// let elapsedTime;
// let attractorTarget;
// function update() {
//     thisTime = new Date().getTime();
//     elapsedTime = thisTime - lastTime;
//     lastTime = thisTime;
//
//     mainUniforms.t.value += elapsedTime / 1000;
//     mainUniforms.screenInverse.value = screenInverse;
//     mainUniforms.attractorPosition.value = attractorPosition;
//     mainUniforms.mousePosition.value = mousePositionNow;
//     mainUniforms.aspectRatio.value = window.innerHeight / window.innerWidth;
//     mainUniforms.ticksSinceMotion.value = ticksSinceMotion;
//     mainUniforms.field.value = computer.currentRenderTarget('field').texture;
//
//     fieldUniforms.aspectRatio.value = window.innerHeight / window.innerWidth;
//     fieldUniforms.screenInverse.value = screenInverse;
//     fieldUniforms.attractorPosition.value = attractorPosition;
//     fieldUniforms.attractorSpeed.value = attractorVelocity.length();
// }
//
//
// function updateMouse() {
//     let mouseMoved = false;
//     let dMouseX = mousePositionNow.x - mousePositionLast.x;
//     let dMouseY = mousePositionNow.y - mousePositionLast.y;
//     if (dMouseX !== 0 || dMouseY !== 0) {
//         mouseMoved = true;
//     }
//     mousePositionLast.x = mousePositionNow.x;
//     mousePositionLast.y = mousePositionNow.y;
//
//     return mouseMoved;
// }
//
//
// function render() {
//     computer.compute();
//
//     renderer.setSize(cWidth, cHeight);
//     // renderer.clear();
//     renderer.render(mainScene, mainCamera);
//
// }
//
//
// function setupComputer() {
//     computer = new ComputeRenderer(renderer);
//
//     computer.addVariable(
//         'field',
//         shaderSources['feedback.frag'],
//         fieldUniforms,
//         initField,
//         window.innerWidth,
//         window.innerHeight,
//         THREE.LinearFilter,
//         THREE.LinearFilter
//     );
//
//     computer.setVariableDependencies('field', ['field']);
//
//     let initStatus = computer.init();
//     if (initStatus !== null) {
//         console.log(initStatus);
//     }
// }
//
//
// function initField(texture) {
//     let data = texture.image.data;
//     for (let i = 0; i < data.length; i++) {
//         data[i] = 0;
//     }
// }
//
//
// /**
//  * Load GLSL shader source code into strings.
//  * @returns {*}
//  */
// function loadFiles() {
//     return $.when.apply($, shaderFiles.map(loadFile));
// }
// function loadFile(fileName) {
//     let fullName = './glsl/' + fileName;
//     return $.ajax(fullName).then(function(data) {
//         shaderSources[fileName] = data;
//     });
// }

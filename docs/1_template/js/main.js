// List of shader source file names
const shaderFiles = [
    'quad.frag',
    'quad.vert'
];
let shaderSources = {};

// THREE.js scene
let scene;
// Scene camera
let dummy_camera = new THREE.PerspectiveCamera(
    60,  // Field of view
    window.innerWidth/window.innerHeight,  // Aspect ratio
    0.1,  // Near clipping plane
    10000  // Far clipping plane
);
// THREE.js renderer
let renderer;
// Plane geometry
let geo;
// Plane shader
let shaderMaterial;
// Plane mesh
let plane;
// Plane shader uniforms
let uniforms;

// Size of the tile plane in whatever units THREE.js geometries use
let xSize;
let ySize;

// Mouse coordinates
let mouseX = 0.5;
let mouseY = 0.5;

// True if WebGL is supported
let hasWebGL = true;

$(window).resize(onResize);
$(window).mousemove(onMouseMove);

$(document).ready(function() {
    loadFiles().then(onReady);
});

/**
 * Sketch on ready function.
 */
function onReady() {
    if (hasWebGL) {
        // Initialize the sketch
        init();

        if (hasWebGL) {
            // Run the sketch
            animate();
        } else {
            $('#nowebglpanel').show()
        }
    } else {
        $('#nowebglpanel').show();
    }

}


/**
 * Initialize the scene and its objects
 */
let firstTime = true;
function init() {
    xSize = window.innerWidth;
    ySize = window.innerHeight;

    // Create the scene
    scene = new THREE.Scene();

    if (firstTime) {
        $('#nowebglpanel').hide();
        firstTime = false;
        // Create the renderer
        hasWebGL = initWebGL();
    }

    if (hasWebGL) {
        // Render size and aspect setup
        resize();

        // Add an ambient light
        let ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
        scene.add(ambientLight);

        // Create the plane geometry
        geo = new THREE.PlaneGeometry(2, 2, 1, 1);
        // Create the plane material
        buildShader();

        // Create the plane mesh
        plane = new THREE.Mesh(geo, shaderMaterial);
        scene.add(plane)
    }
}


/**
 * Main animation loop.
 */
let startTime = new Date().getTime();
let lastTime = startTime;
let thisTime;
let elapsedTime;
function animate() {
    requestAnimationFrame(animate);

    thisTime = new Date().getTime();
    elapsedTime = thisTime - lastTime;
    lastTime = thisTime;

    // Update scene logic
    update();

    // Render the scene
    renderer.render(scene, dummy_camera);
}


/**
 * Update scene logic
 */
function update() {
    uniforms.t.value += elapsedTime / 1000.;
    uniforms.mousePosition.value = new THREE.Vector2(mouseX, mouseY);
    uniforms.planeSize.value = new THREE.Vector2(0.5 / window.innerWidth,
        0.5 / window.innerHeight);
    uniforms.aspectRatio.value = window.innerHeight / window.innerWidth;
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


/**
 * Build the quad shader.
 */
function buildShader() {
    uniforms = {
        t: {value: 0.},
        mousePosition: {value: new THREE.Vector2(mouseX, mouseY)},
        planeSize: {value: new THREE.Vector2(0.5 / window.innerWidth,
                                             0.5 / window.innerHeight)},
        aspectRatio: {value: window.innerHeight / window.innerWidth}
    };
    shaderMaterial = new THREE.ShaderMaterial({
        uniforms: uniforms,
        vertexShader: shaderSources['quad.vert'],
        fragmentShader: shaderSources['quad.frag']
    })
}


/**
 * Initialize WebGL rendering.
 */
function initWebGL() {
    try {
        let canvas = $('canvas').get()[0];
        renderer = new THREE.WebGLRenderer({
            canvas: canvas,
            antialias: true
        });
        renderer.setClearColor(0xcecece);

        return !! ( window.WebGLRenderingContext &&
            ( canvas.getContext( 'webgl' ) || canvas.getContext( 'experimental-webgl' ) ) );
    } catch (e) {
        return false;
    }
}


/**
 * Handle resize events.
 */
function onResize() {
    if (document.readyState === 'complete') {
        cancelAnimationFrame(animate);
        onReady();
    }
}

/**
 * Update renderer and camera when the window is resized.
 */
function resize() {
    // Set renderer size and pixel ratio
    renderer.setSize(xSize, ySize, false);
    renderer.setPixelRatio(1);
    // renderer.setPixelRatio(window.devicePixelRatio ? window.devicePixelRatio : 1);
    // Set camera aspect ratio
    dummy_camera.aspect = window.innerWidth / window.innerHeight;
    dummy_camera.updateProjectionMatrix();
}


/**
 * Handle mouse move events.
 */
function onMouseMove(event) {
    let x = event.clientX;
    let y = event.clientY;
    mouseX = -1. + 2. * x / window.innerWidth + 0.5 / window.innerWidth;
    mouseY = -1 + 2. * (1. - y / window.innerHeight) + 0.5 / window.innerHeight;
    mouseY *= window.innerHeight / window.innerWidth;
}

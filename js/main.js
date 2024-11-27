import { createShaderProgram } from './shaders.js';
import { Model } from './model.js';
import { LoadTexture } from './textureLoader.js';
import { CreateSurfaceData } from './geometry.js';

let gl;
let surface;
let shProgram;
let spaceball;
let textures = null;

const textureState = {
    scalePoint: { u: 0.5, v: 0.5 },
    scaleFactor: 1.0,
    moveSpeed: 0.2,
    scaleSpeed: 0.2
};

function init() {
    let canvas = document.getElementById("webglcanvas");
    if (!canvas) {
        console.error("Canvas element not found!");
        return;
    }

    try {
        gl = canvas.getContext("webgl");
        if (!gl) {
            console.error("Browser does not support WebGL");
            const holder = document.getElementById("canvas-holder");
            if (holder) {
                holder.innerHTML = "<p>Sorry, could not get a WebGL graphics context.</p>";
            }
            return;
        }
    } catch (e) {
        console.error("Error initializing WebGL:", e);
        const holder = document.getElementById("canvas-holder");
        if (holder) {
            holder.innerHTML = "<p>Sorry, could not get a WebGL graphics context.</p>";
        }
        return;
    }
    
    try {
        spaceball = new TrackballRotator(canvas, draw, 0);

        shProgram = createShaderProgram(gl);
        loadTextures();

        gl.enable(gl.DEPTH_TEST);
    }
    catch (e) {
        console.error("Error in initialization:", e);
        const holder = document.getElementById("canvas-holder");
        if (holder) {
            holder.innerHTML = "<p>Sorry, could not initialize the WebGL graphics context: " + e + "</p>";
        }
        return;
    }
    
    window.addEventListener('keydown', handleKeyPress);
}

function loadTextures() {
    textures = {
        diffuse: LoadTexture(gl, "textures/diffuse.png"),
        specular: LoadTexture(gl, "textures/specular.png"),
        normal: LoadTexture(gl, "textures/normal.png")
    };
    
    initSurface();
}

function initSurface() {
    let data = {};
    CreateSurfaceData(data, textureState.scalePoint, textureState.scaleFactor);

    surface = new Model('Surface', gl, shProgram);
    surface.BufferData(data.verticesF32, data.indicesU16, data.texcoordsF32,
                      data.normalsF32, data.tangentsF32, data.bitangentsF32);

    if (textures) {
        surface.diffuseMap = textures.diffuse;
        surface.specularMap = textures.specular;
        surface.normalMap = textures.normal;
    }

    draw();
}

function handleKeyPress(event) {
    let needsUpdate = true;
    
    switch(event.key.toLowerCase()) {
        case 'w':
            textureState.scalePoint.v = Math.max(0, textureState.scalePoint.v - textureState.moveSpeed);
            break;
        case 's':
            textureState.scalePoint.v = Math.min(1, textureState.scalePoint.v + textureState.moveSpeed);
            break;
        case 'a':
            textureState.scalePoint.u = Math.max(0, textureState.scalePoint.u - textureState.moveSpeed);
            break;
        case 'd':
            textureState.scalePoint.u = Math.min(1, textureState.scalePoint.u + textureState.moveSpeed);
            break;
        case '+':
        case '=':
            textureState.scaleFactor += textureState.scaleSpeed;
            break;
        case '-':
            textureState.scaleFactor = Math.max(0.1, textureState.scaleFactor - textureState.scaleSpeed);
            break;
        default:
            needsUpdate = false;
    }

    if (needsUpdate) {
        initSurface();
    }
}

function draw() {
    if (!surface || !surface.diffuseMap) return;

    gl.clearColor(0,0,0,1);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    
    let projection = m4.perspective(Math.PI/8, 1, 8, 12);
    let modelView = spaceball.getViewMatrix();
    let rotateToPointZero = m4.axisRotation([0.707,0.707,0], 0.7);
    let translateToPointZero = m4.translation(0,0,-10);
    let matAccum0 = m4.multiply(rotateToPointZero, modelView);
    let matAccum1 = m4.multiply(translateToPointZero, matAccum0);
    let modelViewProjection = m4.multiply(projection, matAccum1);
    let normalMatrix = m4.transpose(m4.inverse(matAccum1));

    surface.draw(modelView, modelViewProjection, normalMatrix);
}

window.onload = init;

export { draw };
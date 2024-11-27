import { createShaderProgram } from './shaders.js';
import { Model } from './model.js';
import { LoadTexture } from './textureLoader.js';
import { CreateSurfaceData } from './geometry.js';

let gl;                         
let surface;                    
let shProgram;                  
let spaceball;                  

function init() {
    let canvas;
    try {
        canvas = document.getElementById("webglcanvas");
        gl = canvas.getContext("webgl");
        if (!gl) throw "Browser does not support WebGL";
    }
    catch (e) {
        document.getElementById("canvas-holder").innerHTML =
            "<p>Sorry, could not get a WebGL graphics context.</p>";
        return;
    }
    
    try {
        shProgram = createShaderProgram(gl);
        let data = {};
        CreateSurfaceData(data);

        surface = new Model('Surface', gl, shProgram);
        surface.BufferData(data.verticesF32, data.indicesU16, data.texcoordsF32,
                          data.normalsF32, data.tangentsF32, data.bitangentsF32);

        surface.diffuseMap = LoadTexture(gl, "textures/diffuse.png");
        surface.specularMap = LoadTexture(gl, "textures/specular.png");
        surface.normalMap = LoadTexture(gl, "textures/normal.png");

        gl.enable(gl.DEPTH_TEST);
    }
    catch (e) {
        document.getElementById("canvas-holder").innerHTML =
            "<p>Sorry, could not initialize the WebGL graphics context: " + e + "</p>";
        return;
    }

    spaceball = new TrackballRotator(canvas, draw, 0);
    draw();
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
'use strict';

let gl;                         // The webgl context.
let surface;                    // A surface model
let shProgram;                  // A shader program
let lightPoint;                 // Light point model
let lightAngle = 0;            // Angle for rotating light

function ShaderProgram(name, program) {
    this.name = name;
    this.prog = program;
    this.iAttribVertex = -1;
    this.iAttribNormal = -1;
    this.iColor = -1;
    this.iModelViewProjectionMatrix = -1;
    this.iModelViewMatrix = -1;
    this.iLightPosition = -1;

    this.Use = function() {
        gl.useProgram(this.prog);
    }
}


function createLightPointData() {
    const pointSize = 0.1;
    const vertices = new Float32Array([
        0, 0, 0,
    ]);
    
    const normals = new Float32Array([
        0, 1, 0,
    ]);
    
    const indices = new Uint16Array([0]);
    
    return {
        verticesF32: vertices,
        normalsF32: normals,
        indicesU16: indices
    };
}

function draw() { 
    gl.clearColor(1, 1, 1, 1);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    
    // Update light position
    lightAngle += 0.02;
    const lightPosition = [
        4 * Math.cos(lightAngle),
        2.5,
        4 * Math.sin(lightAngle)
    ];
    
    // Create matrices
    const projection = m4.perspective(Math.PI/3, 1, 1, 30);
    let modelView = m4.translation(0, -2, -12);
    let rotationX = m4.xRotation(Math.PI * 0.2);
    modelView = m4.multiply(modelView, rotationX);
    let rotationY = m4.yRotation(Math.PI * 0.1);
    modelView = m4.multiply(modelView, rotationY);
    
    const modelViewProjection = m4.multiply(projection, modelView);

    // Draw sphere
    gl.uniformMatrix4fv(shProgram.iModelViewProjectionMatrix, false, modelViewProjection);
    gl.uniformMatrix4fv(shProgram.iModelViewMatrix, false, modelView);
    gl.uniform3fv(shProgram.iLightPosition, lightPosition);
    gl.uniform4fv(shProgram.iColor, [0.9, 0.9, 0.9, 1]);
    surface.Draw();

    // Draw light point
    let lightModelView = m4.multiply(modelView, m4.translation(lightPosition[0], lightPosition[1], lightPosition[2]));
    let lightModelViewProjection = m4.multiply(projection, lightModelView);
    
    gl.uniformMatrix4fv(shProgram.iModelViewProjectionMatrix, false, lightModelViewProjection);
    gl.uniformMatrix4fv(shProgram.iModelViewMatrix, false, lightModelView);
    gl.uniform4fv(shProgram.iColor, [0, 0, 0, 1]);
    
    gl.enable(gl.VERTEX_PROGRAM_POINT_SIZE);
    lightPoint.Draw();
    gl.disable(gl.VERTEX_PROGRAM_POINT_SIZE);
    
    requestAnimationFrame(draw);
}

function createProgram(gl, vShader, fShader) {
    let vsh = gl.createShader(gl.VERTEX_SHADER);
    gl.shaderSource(vsh, vShader);
    gl.compileShader(vsh);
    if (!gl.getShaderParameter(vsh, gl.COMPILE_STATUS)) {
        throw new Error("Error in vertex shader:  " + gl.getShaderInfoLog(vsh));
    }
    let fsh = gl.createShader(gl.FRAGMENT_SHADER);
    gl.shaderSource(fsh, fShader);
    gl.compileShader(fsh);
    if (!gl.getShaderParameter(fsh, gl.COMPILE_STATUS)) {
        throw new Error("Error in fragment shader:  " + gl.getShaderInfoLog(fsh));
    }
    let prog = gl.createProgram();
    gl.attachShader(prog, vsh);
    gl.attachShader(prog, fsh);
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
        throw new Error("Link error in program:  " + gl.getProgramInfoLog(prog));
    }
    return prog;
}

function initGL() {
    let prog = createProgram(gl, vertexShaderSource, fragmentShaderSource);
    shProgram = new ShaderProgram('Basic', prog);
    shProgram.Use();

    shProgram.iAttribVertex = gl.getAttribLocation(prog, "vertex");
    shProgram.iAttribNormal = gl.getAttribLocation(prog, "normal");
    shProgram.iModelViewProjectionMatrix = gl.getUniformLocation(prog, "ModelViewProjectionMatrix");
    shProgram.iModelViewMatrix = gl.getUniformLocation(prog, "ModelViewMatrix");
    shProgram.iLightPosition = gl.getUniformLocation(prog, "lightPosition");
    shProgram.iColor = gl.getUniformLocation(prog, "color");

    surface = new Model('Surface');
    let data = {};
    CreateSurfaceData(data);
    surface.BufferData(data.verticesF32, data.normalsF32, data.indicesU16);

    lightPoint = new Model('LightPoint');
    lightPoint.isPoint = true;
    let lightData = createLightPointData();
    lightPoint.BufferData(lightData.verticesF32, lightData.normalsF32);

    gl.enable(gl.DEPTH_TEST);
}

function updateSurface() {
    let uDivs = parseInt(document.getElementById('uSlider').value);
    let vDivs = parseInt(document.getElementById('vSlider').value);
    
    document.getElementById('uValue').textContent = uDivs;
    document.getElementById('vValue').textContent = vDivs;
    
    let data = {};
    CreateSurfaceData(data, uDivs, vDivs);
    surface.BufferData(data.verticesF32, data.normalsF32, data.indicesU16);
}

function init() {
    try {
        let canvas = document.getElementById("webglcanvas");
        gl = canvas.getContext("webgl");
        if (!gl) {
            throw "Browser does not support WebGL";
        }
    }
    catch (e) {
        document.getElementById("canvas-holder").innerHTML =
            "<p>Sorry, could not get a WebGL graphics context.</p>";
        return;
    }
    
    try {
        initGL();
        document.getElementById('uValue').textContent = "30";
        document.getElementById('vValue').textContent = "30";
    }
    catch (e) {
        document.getElementById("canvas-holder").innerHTML =
            "<p>Sorry, could not initialize the WebGL graphics context: " + e + "</p>";
        return;
    }

    document.getElementById('uSlider').addEventListener('input', updateSurface);
    document.getElementById('vSlider').addEventListener('input', updateSurface);

    requestAnimationFrame(draw);
}

window.onload = init;
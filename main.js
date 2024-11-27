import { Model } from './modules/model.js';
import { ShaderProgram } from './modules/shader-program.js';
import { createSurfaceData, createLightPointData } from './modules/geometry.js';
import { vertexShaderSource, fragmentShaderSource } from './modules/shaders.js';

let gl, surface, shaderProgram, lightPoint;
let lightAngle = 0;

function initGL(canvas) {
    gl = canvas.getContext("webgl");
    if (!gl) throw "Browser does not support WebGL";

    shaderProgram = new ShaderProgram(gl, vertexShaderSource, fragmentShaderSource);
    shaderProgram.use();

    surface = new Model(gl, 'Surface');
    const data = createSurfaceData();
    surface.bufferData(data.verticesF32, data.normalsF32, data.indicesU16, shaderProgram);

    lightPoint = new Model(gl, 'LightPoint');
    lightPoint.isPoint = true;
    const lightData = createLightPointData();
    lightPoint.bufferData(lightData.verticesF32, lightData.normalsF32, null, shaderProgram);

    gl.enable(gl.DEPTH_TEST);
}

function draw() {
    gl.clearColor(1, 1, 1, 1);
   gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
   
   // Update light position with smaller radius
   lightAngle += 0.02;
   const lightPosition = [
    5 * Math.cos(lightAngle), // збільшено радіус
    4, // підняте вище
    5 * Math.sin(lightAngle)
    ];
   
   // Create projection matrix
   const projection = m4.perspective(Math.PI/3, 1, 1, 30);
   
   let modelView = m4.translation(0, 0, -10); // змінено з (0, -2, -12)
    let rotationX = m4.xRotation(Math.PI * 0.3); // збільшено кут повороту
    modelView = m4.multiply(modelView, rotationX);
    let rotationY = m4.yRotation(lightAngle * 0.1); // додано анімацію повороту
    modelView = m4.multiply(modelView, rotationY);  
   
   // Combine matrices
   const modelViewProjection = m4.multiply(projection, modelView);

   // Draw sphere
   gl.uniformMatrix4fv(shaderProgram.iModelViewProjectionMatrix, false, modelViewProjection);
   gl.uniformMatrix4fv(shaderProgram.iModelViewMatrix, false, modelView);
   gl.uniform3fv(shaderProgram.iLightPosition, lightPosition);
   gl.uniform4fv(shaderProgram.iColor, [0.9, 0.9, 0.9, 1]);
   surface.draw();

   // Draw light point
   let lightModelView = m4.multiply(modelView, m4.translation(lightPosition[0], lightPosition[1], lightPosition[2]));
   let lightModelViewProjection = m4.multiply(projection, lightModelView);
   
   gl.uniformMatrix4fv(shaderProgram.iModelViewProjectionMatrix, false, lightModelViewProjection);
   gl.uniformMatrix4fv(shaderProgram.iModelViewMatrix, false, lightModelView);
   gl.uniform4fv(shaderProgram.iColor, [0, 0, 0, 1]);
   
   gl.enable(gl.PROGRAM_POINT_SIZE);
   lightPoint.draw();
   gl.disable(gl.PROGRAM_POINT_SIZE);
   
   requestAnimationFrame(draw);
}

function init() {
    const canvas = document.getElementById("webglcanvas");
    initGL(canvas);
    
    document.getElementById('uSlider').addEventListener('input', updateSurface);
    document.getElementById('vSlider').addEventListener('input', updateSurface);
    
    requestAnimationFrame(draw);
}

function updateSurface() {
    const uDivs = parseInt(document.getElementById('uSlider').value);
    const vDivs = parseInt(document.getElementById('vSlider').value);
    
    document.getElementById('uValue').textContent = uDivs;
    document.getElementById('vValue').textContent = vDivs;
    
    const data = createSurfaceData(uDivs, vDivs);
    surface.bufferData(data.verticesF32, data.normalsF32, data.indicesU16, shaderProgram);
}

window.onload = init;
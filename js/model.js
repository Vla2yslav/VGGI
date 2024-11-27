export class Model {
    constructor(name, gl, shaderProgram) {
        this.gl = gl;
        this.shaderProgram = shaderProgram;
        this.name = name;
        this.iVertexBuffer = gl.createBuffer();
        this.iNormalBuffer = gl.createBuffer();
        this.iTangentBuffer = gl.createBuffer();
        this.iBitangentBuffer = gl.createBuffer();
        this.iTexCoordsBuffer = gl.createBuffer();
        this.iIndexBuffer = gl.createBuffer();
        this.count = 0;

        this.diffuseMap = null;
        this.specularMap = null;
        this.normalMap = null;

        this.initAttributes();
    }

    initAttributes() {
        const gl = this.gl;
        const prog = this.shaderProgram;

        this.iAttribVertex = gl.getAttribLocation(prog, "vertex");
        this.iAttribNormal = gl.getAttribLocation(prog, "normal");
        this.iAttribTangent = gl.getAttribLocation(prog, "tangent");
        this.iAttribBitangent = gl.getAttribLocation(prog, "bitangent");
        this.iAttribTexCoords = gl.getAttribLocation(prog, "tex");

        this.iModelViewMatrix = gl.getUniformLocation(prog, "ModelViewMatrix");
        this.iModelViewProjectionMatrix = gl.getUniformLocation(prog, "ModelViewProjectionMatrix");
        this.iNormalMatrix = gl.getUniformLocation(prog, "NormalMatrix");
        this.iLightPos = gl.getUniformLocation(prog, "lightPos");
        this.iViewPos = gl.getUniformLocation(prog, "viewPos");
        this.iDiffuseMap = gl.getUniformLocation(prog, "diffuseMap");
        this.iSpecularMap = gl.getUniformLocation(prog, "specularMap");
        this.iNormalMap = gl.getUniformLocation(prog, "normalMap");
    }

    BufferData(vertices, indices, texCoords, normals, tangents, bitangents) {
        const gl = this.gl;

        gl.bindBuffer(gl.ARRAY_BUFFER, this.iVertexBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

        gl.bindBuffer(gl.ARRAY_BUFFER, this.iNormalBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, normals, gl.STATIC_DRAW);

        gl.bindBuffer(gl.ARRAY_BUFFER, this.iTangentBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, tangents, gl.STATIC_DRAW);

        gl.bindBuffer(gl.ARRAY_BUFFER, this.iBitangentBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, bitangents, gl.STATIC_DRAW);

        gl.bindBuffer(gl.ARRAY_BUFFER, this.iTexCoordsBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, texCoords, gl.STATIC_DRAW);

        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.iIndexBuffer);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW);

        this.count = indices.length;
    }

    draw(modelViewMatrix, modelViewProjectionMatrix, normalMatrix) {
        const gl = this.gl;

        gl.useProgram(this.shaderProgram);

        gl.uniformMatrix4fv(this.iModelViewMatrix, false, modelViewMatrix);
        gl.uniformMatrix4fv(this.iModelViewProjectionMatrix, false, modelViewProjectionMatrix);
        gl.uniformMatrix4fv(this.iNormalMatrix, false, normalMatrix);

        gl.uniform3fv(this.iLightPos, [2.0, 2.0, 2.0]);
        gl.uniform3fv(this.iViewPos, [0.0, 0.0, 5.0]);

        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, this.diffuseMap);
        gl.uniform1i(this.iDiffuseMap, 0);

        gl.activeTexture(gl.TEXTURE1);
        gl.bindTexture(gl.TEXTURE_2D, this.specularMap);
        gl.uniform1i(this.iSpecularMap, 1);

        gl.activeTexture(gl.TEXTURE2);
        gl.bindTexture(gl.TEXTURE_2D, this.normalMap);
        gl.uniform1i(this.iNormalMap, 2);

        gl.bindBuffer(gl.ARRAY_BUFFER, this.iVertexBuffer);
        gl.vertexAttribPointer(this.iAttribVertex, 3, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(this.iAttribVertex);

        gl.bindBuffer(gl.ARRAY_BUFFER, this.iNormalBuffer);
        gl.vertexAttribPointer(this.iAttribNormal, 3, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(this.iAttribNormal);

        gl.bindBuffer(gl.ARRAY_BUFFER, this.iTangentBuffer);
        gl.vertexAttribPointer(this.iAttribTangent, 3, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(this.iAttribTangent);

        gl.bindBuffer(gl.ARRAY_BUFFER, this.iBitangentBuffer);
        gl.vertexAttribPointer(this.iAttribBitangent, 3, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(this.iAttribBitangent);

        gl.bindBuffer(gl.ARRAY_BUFFER, this.iTexCoordsBuffer);
        gl.vertexAttribPointer(this.iAttribTexCoords, 2, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(this.iAttribTexCoords);

        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.iIndexBuffer);
        gl.drawElements(gl.TRIANGLES, this.count, gl.UNSIGNED_SHORT, 0);
    }
}
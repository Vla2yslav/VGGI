export class Model {
    constructor(gl, name) {
        this.gl = gl;
        this.name = name;
        this.iVertexBuffer = gl.createBuffer();
        this.iNormalBuffer = gl.createBuffer();
        this.iIndexBuffer = gl.createBuffer();
        this.count = 0;
        this.isPoint = false;
    }

    bufferData(vertices, normals, indices, shaderProgram) {
        const gl = this.gl;
        
        gl.bindBuffer(gl.ARRAY_BUFFER, this.iVertexBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);
        gl.vertexAttribPointer(shaderProgram.iAttribVertex, 3, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(shaderProgram.iAttribVertex);

        gl.bindBuffer(gl.ARRAY_BUFFER, this.iNormalBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, normals, gl.STATIC_DRAW);
        gl.vertexAttribPointer(shaderProgram.iAttribNormal, 3, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(shaderProgram.iAttribNormal);

        if (indices) {
            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.iIndexBuffer);
            gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW);
            this.count = indices.length;
        }
    }

    draw() {
        if (this.isPoint) {
            this.gl.drawArrays(this.gl.POINTS, 0, 1);
        } else {
            this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, this.iIndexBuffer);
            this.gl.drawElements(this.gl.TRIANGLES, this.count, this.gl.UNSIGNED_SHORT, 0);
        }
    }
}
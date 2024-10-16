function deg2rad(angle) {
    return angle * Math.PI / 180;
}

function Vertex(p) {
    this.p = p;
    this.normal = [];
    this.triangles = [];
}

function Model() {
    this.iVertexBuffer = gl.createBuffer();
    this.iIndexBuffer = gl.createBuffer();
    this.count = 0;

    this.BufferData = function(vertices, indices) {
        gl.bindBuffer(gl.ARRAY_BUFFER, this.iVertexBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STREAM_DRAW);

        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.iIndexBuffer);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STREAM_DRAW);

        this.count = indices.length;
    }

    this.Draw = function() {
        gl.bindBuffer(gl.ARRAY_BUFFER, this.iVertexBuffer);
        gl.vertexAttribPointer(shProgram.iAttribVertex, 3, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(shProgram.iAttribVertex);

        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.iIndexBuffer);
        gl.drawElements(gl.LINES, this.count, gl.UNSIGNED_SHORT, 0);
    }
}

function CreateTwiceObliqueTrochoidCylindroid(c, H, alpha, p, uMin, uMax, uCount, vMin, vMax, vCount) {
    let vertices = [];
    let indices = [];
    const tgz = Math.tan(alpha);

    for (let i = 0; i <= uCount; i++) {
        const u = uMin + (i / uCount) * (uMax - uMin);
        const theta = p * u;
        
        for (let j = 0; j <= vCount; j++) {
            const v = vMin + (j / vCount) * (vMax - vMin);
            const phi = Math.atan2(v, c);
            
            const x = c * u + v * (Math.sin(phi) + tgz * Math.cos(phi) * Math.cos(theta));
            const y = v * tgz * Math.sin(theta);
            const z = H + v * (tgz * Math.sin(phi) * Math.cos(theta) - Math.cos(phi));
            
            vertices.push(new Vertex([x, y, z]));
        }
    }

    // Generate indices for U polylines
    for (let i = 0; i <= uCount; i++) {
        for (let j = 0; j < vCount; j++) {
            const index = i * (vCount + 1) + j;
            indices.push(index, index + 1);
        }
    }
    
    // Generate indices for V polylines
    for (let j = 0; j <= vCount; j++) {
        for (let i = 0; i < uCount; i++) {
            const index = i * (vCount + 1) + j;
            indices.push(index, index + vCount + 1);
        }
    }

    return { vertices, indices };
}

function CreateSurfaceData() {
    const params = {
        c: 5,
        H: 1,
        alpha: 0.033 * Math.PI,
        p: 8 * Math.PI,
        uMin: 0,
        uMax: 1,
        uCount: 50,
        vMin: -5,
        vMax: 5,
        vCount: 50
    };

    const { vertices, indices } = CreateTwiceObliqueTrochoidCylindroid(
        params.c, params.H, params.alpha, params.p, 
        params.uMin, params.uMax, params.uCount, 
        params.vMin, params.vMax, params.vCount
    );

    const verticesF32 = new Float32Array(vertices.length * 3);
    for (let i = 0; i < vertices.length; i++) {
        verticesF32[i*3] = vertices[i].p[0];
        verticesF32[i*3 + 1] = vertices[i].p[1];
        verticesF32[i*3 + 2] = vertices[i].p[2];
    }

    const indicesU16 = new Uint16Array(indices);

    return { verticesF32, indicesU16 };
}
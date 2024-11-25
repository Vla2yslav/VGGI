function Model(name) {
    this.name = name;
    this.iVertexBuffer = gl.createBuffer();
    this.iNormalBuffer = gl.createBuffer();
    this.iIndexBuffer = gl.createBuffer();
    this.count = 0;
    this.isPoint = false;

    this.BufferData = function(vertices, normals, indices) {
        gl.bindBuffer(gl.ARRAY_BUFFER, this.iVertexBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);
        gl.vertexAttribPointer(shProgram.iAttribVertex, 3, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(shProgram.iAttribVertex);

        gl.bindBuffer(gl.ARRAY_BUFFER, this.iNormalBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, normals, gl.STATIC_DRAW);
        gl.vertexAttribPointer(shProgram.iAttribNormal, 3, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(shProgram.iAttribNormal);

        if (indices) {
            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.iIndexBuffer);
            gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW);
            this.count = indices.length;
        }
    }

    this.Draw = function() {
        if (this.isPoint) {
            gl.drawArrays(gl.POINTS, 0, 1);
        } else {
            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.iIndexBuffer);
            gl.drawElements(gl.TRIANGLES, this.count, gl.UNSIGNED_SHORT, 0);
        }
    }
}

function CreateSurfaceData(data, uDivisions = 30, vDivisions = 30) {
    let vertices = [];
    let normals = [];
    let indices = [];
    const radius = 2.0;

    for (let lat = 0; lat <= vDivisions; lat++) {
        const theta = lat * Math.PI / vDivisions;
        for (let lon = 0; lon <= uDivisions; lon++) {
            const phi = lon * 2 * Math.PI / uDivisions;

            const sinTheta = Math.sin(theta);
            const cosTheta = Math.cos(theta);
            const sinPhi = Math.sin(phi);
            const cosPhi = Math.cos(phi);

            const x = radius * sinTheta * cosPhi;
            const y = radius * cosTheta;
            const z = radius * sinTheta * sinPhi;

            vertices.push(x, y, z);

            normals.push(0, 0, 0);
        }
    }

    for (let lat = 0; lat < vDivisions; lat++) {
        for (let lon = 0; lon < uDivisions; lon++) {
            const current = lat * (uDivisions + 1) + lon;
            const next = current + 1;
            const below = (lat + 1) * (uDivisions + 1) + lon;
            const belowNext = below + 1;

            indices.push(current, below, next);
            indices.push(next, below, belowNext);

            const v0 = [
                vertices[current * 3],
                vertices[current * 3 + 1],
                vertices[current * 3 + 2]
            ];
            const v1 = [
                vertices[below * 3],
                vertices[below * 3 + 1],
                vertices[below * 3 + 2]
            ];
            const v2 = [
                vertices[next * 3],
                vertices[next * 3 + 1],
                vertices[next * 3 + 2]
            ];

            const edge1 = [
                v1[0] - v0[0],
                v1[1] - v0[1],
                v1[2] - v0[2]
            ];
            const edge2 = [
                v2[0] - v0[0],
                v2[1] - v0[1],
                v2[2] - v0[2]
            ];

            const faceNormal = [
                edge2[1] * edge1[2] - edge2[2] * edge1[1],
                edge2[2] * edge1[0] - edge2[0] * edge1[2],
                edge2[0] * edge1[1] - edge2[1] * edge1[0]
            ];

            const length = Math.sqrt(
                faceNormal[0] * faceNormal[0] +
                faceNormal[1] * faceNormal[1] +
                faceNormal[2] * faceNormal[2]
            );

            faceNormal[0] /= length;
            faceNormal[1] /= length;
            faceNormal[2] /= length;

            for (let vertIndex of [current, below, next]) {
                normals[vertIndex * 3] = faceNormal[0];
                normals[vertIndex * 3 + 1] = faceNormal[1];
                normals[vertIndex * 3 + 2] = faceNormal[2];
            }

            for (let vertIndex of [next, below, belowNext]) {
                normals[vertIndex * 3] = faceNormal[0];
                normals[vertIndex * 3 + 1] = faceNormal[1];
                normals[vertIndex * 3 + 2] = faceNormal[2];
            }
        }
    }

    data.verticesF32 = new Float32Array(vertices);
    data.normalsF32 = new Float32Array(normals);
    data.indicesU16 = new Uint16Array(indices);
}
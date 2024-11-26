function Model(name) {
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

    this.BufferData = function(vertices, indices, texCoords, normals, tangents, bitangents) {
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

    this.Draw = function() {
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, this.diffuseMap);

        gl.activeTexture(gl.TEXTURE1);
        gl.bindTexture(gl.TEXTURE_2D, this.specularMap);

        gl.activeTexture(gl.TEXTURE2);
        gl.bindTexture(gl.TEXTURE_2D, this.normalMap);

        gl.bindBuffer(gl.ARRAY_BUFFER, this.iVertexBuffer);
        gl.vertexAttribPointer(shProgram.iAttribVertex, 3, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(shProgram.iAttribVertex);

        gl.bindBuffer(gl.ARRAY_BUFFER, this.iNormalBuffer);
        gl.vertexAttribPointer(shProgram.iAttribNormal, 3, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(shProgram.iAttribNormal);

        gl.bindBuffer(gl.ARRAY_BUFFER, this.iTangentBuffer);
        gl.vertexAttribPointer(shProgram.iAttribTangent, 3, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(shProgram.iAttribTangent);

        gl.bindBuffer(gl.ARRAY_BUFFER, this.iBitangentBuffer);
        gl.vertexAttribPointer(shProgram.iAttribBitangent, 3, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(shProgram.iAttribBitangent);

        gl.bindBuffer(gl.ARRAY_BUFFER, this.iTexCoordsBuffer);
        gl.vertexAttribPointer(shProgram.iAttribTexCoords, 2, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(shProgram.iAttribTexCoords);

        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.iIndexBuffer);
        gl.drawElements(gl.TRIANGLES, this.count, gl.UNSIGNED_SHORT, 0);
    }
}

function CreateSurfaceData(data) {
    const vertices = [
        // Front face
        -0.75, -0.75,  0.75,    0.75, -0.75,  0.75,    0.75,  0.75,  0.75,    -0.75,  0.75,  0.75,
        // Back face
        -0.75, -0.75, -0.75,    -0.75,  0.75, -0.75,    0.75,  0.75, -0.75,    0.75, -0.75, -0.75,
        // Top face
        -0.75,  0.75, -0.75,    -0.75,  0.75,  0.75,    0.75,  0.75,  0.75,    0.75,  0.75, -0.75,
        // Bottom face
        -0.75, -0.75, -0.75,    0.75, -0.75, -0.75,    0.75, -0.75,  0.75,    -0.75, -0.75,  0.75,
        // Right face
        0.75, -0.75, -0.75,    0.75,  0.75, -0.75,    0.75,  0.75,  0.75,    0.75, -0.75,  0.75,
        // Left face
        -0.75, -0.75, -0.75,    -0.75, -0.75,  0.75,    -0.75,  0.75,  0.75,    -0.75,  0.75, -0.75,
    ];

    const texcoords = [
        // Front
        0.0, 1.0,    1.0, 1.0,    1.0, 0.0,    0.0, 0.0,
        // Back
        1.0, 1.0,    1.0, 0.0,    0.0, 0.0,    0.0, 1.0,
        // Top
        0.0, 1.0,    1.0, 1.0,    1.0, 0.0,    0.0, 0.0,
        // Bottom
        0.0, 1.0,    1.0, 1.0,    1.0, 0.0,    0.0, 0.0,
        // Right
        1.0, 1.0,    1.0, 0.0,    0.0, 0.0,    0.0, 1.0,
        // Left
        0.0, 1.0,    1.0, 1.0,    1.0, 0.0,    0.0, 0.0,
    ];

    const normals = [
        // Front
        0.0, 0.0, 1.0,    0.0, 0.0, 1.0,    0.0, 0.0, 1.0,    0.0, 0.0, 1.0,
        // Back
        0.0, 0.0, -1.0,    0.0, 0.0, -1.0,    0.0, 0.0, -1.0,    0.0, 0.0, -1.0,
        // Top
        0.0, 1.0, 0.0,    0.0, 1.0, 0.0,    0.0, 1.0, 0.0,    0.0, 1.0, 0.0,
        // Bottom
        0.0, -1.0, 0.0,    0.0, -1.0, 0.0,    0.0, -1.0, 0.0,    0.0, -1.0, 0.0,
        // Right
        1.0, 0.0, 0.0,    1.0, 0.0, 0.0,    1.0, 0.0, 0.0,    1.0, 0.0, 0.0,
        // Left
        -1.0, 0.0, 0.0,    -1.0, 0.0, 0.0,    -1.0, 0.0, 0.0,    -1.0, 0.0, 0.0,
    ];

    const tangents = [];
    const bitangents = [];

    for(let face = 0; face < 6; face++) {
        let normal = [
            normals[face*12],
            normals[face*12+1],
            normals[face*12+2]
        ];

        let tangent = [1, 0, 0];
        if(Math.abs(normal[0]) > 0.9) {
            tangent = [0, 1, 0];
        }

        let dot = normal[0]*tangent[0] + normal[1]*tangent[1] + normal[2]*tangent[2];
        tangent[0] = tangent[0] - normal[0]*dot;
        tangent[1] = tangent[1] - normal[1]*dot;
        tangent[2] = tangent[2] - normal[2]*dot;

        let length = Math.sqrt(tangent[0]*tangent[0] + tangent[1]*tangent[1] + tangent[2]*tangent[2]);
        tangent = [tangent[0]/length, tangent[1]/length, tangent[2]/length];

        let bitangent = [
            normal[1]*tangent[2] - normal[2]*tangent[1],
            normal[2]*tangent[0] - normal[0]*tangent[2],
            normal[0]*tangent[1] - normal[1]*tangent[0]
        ];

        for(let i = 0; i < 4; i++) {
            tangents.push(...tangent);
            bitangents.push(...bitangent);
        }
    }

    const indices = [
        0,  1,  2,      0,  2,  3,    // front
        4,  5,  6,      4,  6,  7,    // back
        8,  9,  10,     8,  10, 11,   // top
        12, 13, 14,     12, 14, 15,   // bottom
        16, 17, 18,     16, 18, 19,   // right
        20, 21, 22,     20, 22, 23,   // left
    ];

    data.verticesF32 = new Float32Array(vertices);
    data.normalsF32 = new Float32Array(normals);
    data.tangentsF32 = new Float32Array(tangents);
    data.bitangentsF32 = new Float32Array(bitangents);
    data.texcoordsF32 = new Float32Array(texcoords);
    data.indicesU16 = new Uint16Array(indices);
}
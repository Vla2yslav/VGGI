export function CreateSurfaceData(data, scalePoint = { u: 0.5, v: 0.5 }, scaleFactor = 1.0) {
    const segments = 50;
    const vertices = [];
    const texcoords = [];
    const normals = [];
    const indices = [];

    const H = 0.25;
    const c = 1.0;
    const alpha = 0.033 * Math.PI; 
    const p = 8 * Math.PI;         
    const theta0 = 0;       
    const tgz = Math.tan(alpha);     

    for (let i = 0; i <= segments; i++) {
        const u = -1.0 + (2.0 * i) / segments;
        
        for (let j = 0; j <= segments; j++) {
            const v = -5.0 + (10.0 * j) / segments;
            const phi = 0;
            const theta = p * u + theta0;
            
            const x = c * u + v * (Math.sin(phi) + tgz * Math.cos(phi) * Math.cos(theta));
            const y = v * tgz * Math.sin(theta);
            const z = H + v * (tgz * Math.sin(phi) * Math.cos(theta) - Math.cos(phi));

            vertices.push(x, y, z);

            const texU = j / segments;
            const texV = i / segments;
            
            const du = texU - scalePoint.u;
            const dv = texV - scalePoint.v;
            
            const scaledU = scalePoint.u + du * scaleFactor;
            const scaledV = scalePoint.v + dv * scaleFactor;
            
            const wrappedU = ((scaledU % 1) + 1) % 1;
            const wrappedV = ((scaledV % 1) + 1) % 1;
            
            texcoords.push(wrappedU, wrappedV);

            const dx = c + tgz * Math.cos(phi) * Math.cos(theta);
            const dy = tgz * Math.sin(theta);
            const dz = tgz * Math.sin(phi) * Math.cos(theta) - Math.cos(phi);
            
            const nx = dy * 1 - 0 * dz;
            const ny = 0 * dx - 1 * dz;
            const nz = 1 * dy - dy * 1;
            
            const length = Math.sqrt(nx * nx + ny * ny + nz * nz);
            normals.push(nx / length, ny / length, nz / length);
        }
    }

    for (let i = 0; i < segments; i++) {
        for (let j = 0; j < segments; j++) {
            const first = (i * (segments + 1)) + j;
            const second = first + segments + 1;
            indices.push(first, second, first + 1);
            indices.push(second, second + 1, first + 1);
        }
    }

    calculateTangentsAndBitangents(vertices, texcoords, normals, indices, data);

    data.verticesF32 = new Float32Array(vertices);
    data.normalsF32 = new Float32Array(normals);
    data.texcoordsF32 = new Float32Array(texcoords);
    data.indicesU16 = new Uint16Array(indices);
}

function calculateTangentsAndBitangents(vertices, texcoords, normals, indices, data) {
    const tangents = [];
    const bitangents = [];

    for (let i = 0; i < vertices.length / 3; i++) {
        const normal = [
            normals[i * 3],
            normals[i * 3 + 1],
            normals[i * 3 + 2]
        ];
        
        let tangent = [1, 0, 0];
        if (Math.abs(normal[0]) > 0.9) {
            tangent = [0, 1, 0];
        }

        const dot = normal[0]*tangent[0] + normal[1]*tangent[1] + normal[2]*tangent[2];
        tangent[0] = tangent[0] - normal[0]*dot;
        tangent[1] = tangent[1] - normal[1]*dot;
        tangent[2] = tangent[2] - normal[2]*dot;

        const length = Math.sqrt(tangent[0]*tangent[0] + tangent[1]*tangent[1] + tangent[2]*tangent[2]);
        if (length > 0) {
            tangent[0] /= length;
            tangent[1] /= length;
            tangent[2] /= length;
        }

        const bitangent = [
            normal[1]*tangent[2] - normal[2]*tangent[1],
            normal[2]*tangent[0] - normal[0]*tangent[2],
            normal[0]*tangent[1] - normal[1]*tangent[0]
        ];

        tangents.push(...tangent);
        bitangents.push(...bitangent);
    }

    data.tangentsF32 = new Float32Array(tangents);
    data.bitangentsF32 = new Float32Array(bitangents);
}
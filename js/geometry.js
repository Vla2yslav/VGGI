export function CreateSurfaceData(data, scalePoint = { u: 0.5, v: 0.5 }, scaleFactor = 1.0) {
    const segments = 50;
    const vertices = [];
    const texcoords = [];
    const normals = [];
    const indices = [];

    const a = 1.0;
    const b = 0.8;
    const c = 0.6;

    for (let i = 0; i <= segments; i++) {
        const phi = (i * Math.PI) / segments;
        const sinPhi = Math.sin(phi);
        const cosPhi = Math.cos(phi);

        for (let j = 0; j <= segments; j++) {
            const theta = (j * 2 * Math.PI) / segments;
            const sinTheta = Math.sin(theta);
            const cosTheta = Math.cos(theta);

            const x = a * cosTheta * sinPhi * (1 + 0.2 * Math.sin(3 * theta));
            const y = b * sinTheta * sinPhi * (1 + 0.2 * Math.sin(3 * theta));
            const z = c * cosPhi;

            vertices.push(x, y, z);

            const u = j / segments;
            const v = i / segments;
            
            const du = u - scalePoint.u;
            const dv = v - scalePoint.v;
            
            const scaledU = scalePoint.u + du * scaleFactor;
            const scaledV = scalePoint.v + dv * scaleFactor;
            
            const wrappedU = ((scaledU % 1) + 1) % 1;
            const wrappedV = ((scaledV % 1) + 1) % 1;
            
            texcoords.push(wrappedU, wrappedV);

            const nx = x / a;
            const ny = y / b;
            const nz = z / c;
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
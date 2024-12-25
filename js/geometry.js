export function CreateSurfaceData(data) {
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

    const uMin = 0, uMax = 1;
    const vMin = -5, vMax = 5;

    for (let i = 0; i <= segments; i++) {
        const u = uMin + (i * (uMax - uMin)) / segments;
        
        for (let j = 0; j <= segments; j++) {
            const v = vMin + (j * (vMax - vMin)) / segments;
            
            const theta = p * u + theta0;
            const tgAlpha = Math.tan(alpha);
            
            const x = c * u + v * tgAlpha * Math.cos(theta);
            const y = v * tgAlpha * Math.sin(theta);
            const z = H - v;

            vertices.push(x, y, z);
            texcoords.push(j / segments, i / segments);

            const dx_du = c - v * tgAlpha * Math.sin(theta) * p;
            const dy_du = v * tgAlpha * Math.cos(theta) * p;
            const dz_du = 0;

            const dx_dv = tgAlpha * Math.cos(theta);
            const dy_dv = tgAlpha * Math.sin(theta);
            const dz_dv = -1;

            const nx = dy_du * dz_dv - dz_du * dy_dv;
            const ny = dz_du * dx_dv - dx_du * dz_dv;
            const nz = dx_du * dy_dv - dy_du * dx_dv;

            const length = Math.sqrt(nx * nx + ny * ny + nz * nz);
            if (length > 0) {
                normals.push(nx / length, ny / length, nz / length);
            } else {
                normals.push(0, 0, 1);
            }
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

        const tangentLength = Math.sqrt(tangent[0]*tangent[0] + tangent[1]*tangent[1] + tangent[2]*tangent[2]);
        if (tangentLength > 0) {
            tangent = tangent.map(x => x/tangentLength);
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
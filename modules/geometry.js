export function calculateTrochoidalEllipsoidPoint(u, v, a, b, c, n) {
    const x = a * Math.cos(u + n * Math.sin(u));
    const y = b * Math.sin(v);
    const z = c * Math.cos(v);
    return [x, y, z];
}

export function calculateTangents(u, v, a, b, c, n) {
    const dx_du = -a * Math.sin(u + n * Math.sin(u)) * (1 + n * Math.cos(u));
    const dy_du = 0;
    const dz_du = 0;
    const tangentU = [dx_du, dy_du, dz_du];

    const dx_dv = 0;
    const dy_dv = b * Math.cos(v);
    const dz_dv = -c * Math.sin(v);
    const tangentV = [dx_dv, dy_dv, dz_dv];

    return { tangentU, tangentV };
}

export function calculateNormal(tangentU, tangentV) {
    const normal = [
        tangentU[1] * tangentV[2] - tangentU[2] * tangentV[1],
        tangentU[2] * tangentV[0] - tangentU[0] * tangentV[2],
        tangentU[0] * tangentV[1] - tangentU[1] * tangentV[0]
    ];
    
    const length = Math.sqrt(normal[0] * normal[0] + normal[1] * normal[1] + normal[2] * normal[2]);
    return normal.map(n => n / length);
}

export function createSurfaceData(uDivisions = 30, vDivisions = 30) {
    const vertices = [];
    const normals = [];
    const indices = [];

    const a = 2.0, b = 1.5, c = 1.0, n = 0.3;

    for (let i = 0; i <= vDivisions; i++) {
        const v = (i / vDivisions) * 2 * Math.PI;
        
        for (let j = 0; j <= uDivisions; j++) {
            const u = (j / uDivisions) * 2 * Math.PI;
            
            const point = calculateTrochoidalEllipsoidPoint(u, v, a, b, c, n);
            vertices.push(...point);

            const { tangentU, tangentV } = calculateTangents(u, v, a, b, c, n);
            const normal = calculateNormal(tangentU, tangentV);
            normals.push(...normal);
        }
    }

    for (let i = 0; i < vDivisions; i++) {
        for (let j = 0; j < uDivisions; j++) {
            const first = i * (uDivisions + 1) + j;
            const second = first + uDivisions + 1;
            
            indices.push(first, second, first + 1);
            indices.push(second, second + 1, first + 1);
        }
    }

    return {
        verticesF32: new Float32Array(vertices),
        normalsF32: new Float32Array(normals),
        indicesU16: new Uint16Array(indices)
    };
}

export function createLightPointData() {
    return {
        verticesF32: new Float32Array([0, 0, 0]),
        normalsF32: new Float32Array([0, 1, 0])
    };
}
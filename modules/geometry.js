export function calculateTrochoidPoint(u, v, c, H, alpha, p, phi0) {
    const theta = p * u + phi0;
    const tanAlpha = Math.tan(alpha);
    
    const x = c * u + v * (Math.sin(phi0) + tanAlpha * Math.cos(phi0) * Math.cos(theta));
    const y = v * tanAlpha * Math.sin(theta);
    const z = H + v * (tanAlpha * Math.sin(phi0) * Math.cos(theta) - Math.cos(phi0));
    
    return [x, y, z];
}

export function calculateTangents(u, v, c, H, alpha, p, phi0) {
    const theta = p * u + phi0;
    const tanAlpha = Math.tan(alpha);
    
    const dx_du = c + v * tanAlpha * Math.cos(phi0) * (-p * Math.sin(theta));
    const dy_du = v * tanAlpha * p * Math.cos(theta);
    const dz_du = v * tanAlpha * Math.sin(phi0) * (-p * Math.sin(theta));
    const tangentU = [dx_du, dy_du, dz_du];

    const dx_dv = Math.sin(phi0) + tanAlpha * Math.cos(phi0) * Math.cos(theta);
    const dy_dv = tanAlpha * Math.sin(theta);
    const dz_dv = tanAlpha * Math.sin(phi0) * Math.cos(theta) - Math.cos(phi0);
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

    const H = 0.5;
    const c = 2.5;
    const alpha = 0.033 * Math.PI; 
    const p = 8 * Math.PI;         
    const phi0 = 0;                
    
 
    const uMin = 0, uMax = 1;
    const vMin = -5, vMax = 5;

    for (let i = 0; i <= vDivisions; i++) {
        const v = vMin + (i / vDivisions) * (vMax - vMin);
        
        for (let j = 0; j <= uDivisions; j++) {
            const u = uMin + (j / uDivisions) * (uMax - uMin);
            
            const point = calculateTrochoidPoint(u, v, c, H, alpha, p, phi0);
            vertices.push(...point);

            const { tangentU, tangentV } = calculateTangents(u, v, c, H, alpha, p, phi0);
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
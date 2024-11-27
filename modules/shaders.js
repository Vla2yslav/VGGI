export const vertexShaderSource = `
    attribute vec3 vertex;
    attribute vec3 normal;
    uniform mat4 ModelViewProjectionMatrix;
    uniform mat4 ModelViewMatrix;
    uniform vec3 lightPosition;
    
    varying vec3 vNormal;
    varying vec3 vPosition;
    varying vec3 vLightPos;
    
    void main() {
        vec4 viewPosition = ModelViewMatrix * vec4(vertex, 1.0);
        vPosition = viewPosition.xyz;
        vNormal = mat3(ModelViewMatrix) * normal;
        vLightPos = (ModelViewMatrix * vec4(lightPosition, 1.0)).xyz;
        gl_Position = ModelViewProjectionMatrix * vec4(vertex, 1.0);
        gl_PointSize = 10.0;
    }
`;

export const fragmentShaderSource = `
    precision mediump float;
    
    uniform vec4 color;
    varying vec3 vNormal;
    varying vec3 vPosition;
    varying vec3 vLightPos;
    
    void main() {
        vec3 normal = normalize(vNormal);
        vec3 lightDir = normalize(vLightPos - vPosition);
        
        float ambientStrength = 0.3;
        vec3 ambient = ambientStrength * color.rgb;
        
        float diff = max(dot(normal, lightDir), 0.0);
        vec3 diffuse = diff * color.rgb;
        
        vec3 viewDir = normalize(-vPosition);
        vec3 reflectDir = reflect(-lightDir, normal);
        float spec = pow(max(dot(viewDir, reflectDir), 0.0), 32.0);
        float specularStrength = 0.8;
        vec3 specular = specularStrength * spec * vec3(1.0);
        
        vec3 result = ambient + diffuse + specular;
        gl_FragColor = vec4(result, 1.0);
    }
`;
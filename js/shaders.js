const vertexShaderSource = `
attribute vec3 vertex;
attribute vec2 tex;
attribute vec3 normal;
attribute vec3 tangent;
attribute vec3 bitangent;

uniform mat4 ModelViewProjectionMatrix;
uniform mat4 ModelViewMatrix;
uniform mat4 NormalMatrix;

varying vec2 vTexCoord;
varying vec3 vPosition;
varying vec3 vNormal;
varying mat3 vTBN;

void main() {
    vTexCoord = tex;
    vPosition = (ModelViewMatrix * vec4(vertex, 1.0)).xyz;
    vNormal = (NormalMatrix * vec4(normal, 0.0)).xyz;
    
    vec3 T = normalize((NormalMatrix * vec4(tangent, 0.0)).xyz);
    vec3 B = normalize((NormalMatrix * vec4(bitangent, 0.0)).xyz);
    vec3 N = normalize(vNormal);
    vTBN = mat3(T, B, N);
    
    gl_Position = ModelViewProjectionMatrix * vec4(vertex, 1.0);
}`;

const fragmentShaderSource = `
precision mediump float;

uniform vec4 color;
uniform sampler2D diffuseMap;
uniform sampler2D specularMap;
uniform sampler2D normalMap;
uniform vec3 lightPos;
uniform vec3 viewPos;

varying vec2 vTexCoord;
varying vec3 vPosition;
varying vec3 vNormal;
varying mat3 vTBN;

void main() {
    vec4 diffuseColor = texture2D(diffuseMap, vTexCoord);
    vec4 specularColor = texture2D(specularMap, vTexCoord);
    vec3 normalMap = texture2D(normalMap, vTexCoord).rgb;
    
    vec3 normal = normalize(normalMap * 2.0 - 1.0);
    normal = normalize(vTBN * normal);
    
    float ambientStrength = 0.3;
    vec3 ambient = ambientStrength * diffuseColor.rgb;
    
    vec3 lightDir = normalize(lightPos - vPosition);
    float diff = max(dot(normal, lightDir), 0.0);
    vec3 diffuse = diff * diffuseColor.rgb * 0.7;
    
    float specularStrength = specularColor.r * 4.0;
    vec3 viewDir = normalize(viewPos - vPosition);
    vec3 reflectDir = reflect(-lightDir, normal);
    float spec = pow(max(dot(viewDir, reflectDir), 0.0), 12.0);
    vec3 specular = specularStrength * spec * vec3(1.0);
    
    vec3 result = ambient + diffuse + specular;
    gl_FragColor = vec4(result, 1.0);
}`;

export function createShaderProgram(gl) {
    const vertShader = gl.createShader(gl.VERTEX_SHADER);
    gl.shaderSource(vertShader, vertexShaderSource);
    gl.compileShader(vertShader);
    if (!gl.getShaderParameter(vertShader, gl.COMPILE_STATUS)) {
        throw new Error("Vertex shader compilation error: " + gl.getShaderInfoLog(vertShader));
    }

    const fragShader = gl.createShader(gl.FRAGMENT_SHADER);
    gl.shaderSource(fragShader, fragmentShaderSource);
    gl.compileShader(fragShader);
    if (!gl.getShaderParameter(fragShader, gl.COMPILE_STATUS)) {
        throw new Error("Fragment shader compilation error: " + gl.getShaderInfoLog(fragShader));
    }

    const prog = gl.createProgram();
    gl.attachShader(prog, vertShader);
    gl.attachShader(prog, fragShader);
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
        throw new Error("Shader program link error: " + gl.getProgramInfoLog(prog));
    }

    return prog;
}
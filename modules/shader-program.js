export class ShaderProgram {
    constructor(gl, vertexShaderSource, fragmentShaderSource) {
        this.gl = gl;
        this.program = this.createProgram(vertexShaderSource, fragmentShaderSource);
        this.initLocations();
    }

    createProgram(vShaderSource, fShaderSource) {
        const gl = this.gl;
        const vsh = gl.createShader(gl.VERTEX_SHADER);
        gl.shaderSource(vsh, vShaderSource);
        gl.compileShader(vsh);
        if (!gl.getShaderParameter(vsh, gl.COMPILE_STATUS)) {
            throw new Error("Vertex shader error: " + gl.getShaderInfoLog(vsh));
        }

        const fsh = gl.createShader(gl.FRAGMENT_SHADER);
        gl.shaderSource(fsh, fShaderSource);
        gl.compileShader(fsh);
        if (!gl.getShaderParameter(fsh, gl.COMPILE_STATUS)) {
            throw new Error("Fragment shader error: " + gl.getShaderInfoLog(fsh));
        }

        const prog = gl.createProgram();
        gl.attachShader(prog, vsh);
        gl.attachShader(prog, fsh);
        gl.linkProgram(prog);
        if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
            throw new Error("Link error: " + gl.getProgramInfoLog(prog));
        }

        return prog;
    }

    initLocations() {
        const gl = this.gl;
        this.iAttribVertex = gl.getAttribLocation(this.program, "vertex");
        this.iAttribNormal = gl.getAttribLocation(this.program, "normal");
        this.iModelViewMatrix = gl.getUniformLocation(this.program, "ModelViewMatrix");
        this.iModelViewProjectionMatrix = gl.getUniformLocation(this.program, "ModelViewProjectionMatrix");
        this.iLightPosition = gl.getUniformLocation(this.program, "lightPosition");
        this.iColor = gl.getUniformLocation(this.program, "color");
    }

    use() {
        this.gl.useProgram(this.program);
    }
}
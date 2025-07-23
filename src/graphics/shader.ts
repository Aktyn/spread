import fullscreenVertexShader from "../assets/shaders/main-vs.glsl?raw"
import fullscreenFragmentShader from "../assets/shaders/main-fs.glsl?raw"
import { assert } from "../lib/utils"

enum ShaderVariant {
  Fullscreen = "fullscreen",
}

const sources: {
  [key in ShaderVariant]: { vertex: string; fragment: string }
} = {
  [ShaderVariant.Fullscreen]: {
    vertex: fullscreenVertexShader,
    fragment: fullscreenFragmentShader,
  },
}

export class Shader<Attributes extends string, Uniforms extends string> {
  public static readonly Variants = ShaderVariant

  public readonly program: WebGLProgram
  public readonly attributes: Record<Attributes, number>
  public readonly uniforms: Record<Uniforms, WebGLUniformLocation>

  constructor(
    private readonly gl: WebGL2RenderingContext,
    variant: ShaderVariant,
    attributeNames: Attributes[],
    uniformNames: Uniforms[],
  ) {
    const vertexShader = createShader(
      gl,
      gl.VERTEX_SHADER,
      sources[variant].vertex,
    )
    const fragmentShader = createShader(
      gl,
      gl.FRAGMENT_SHADER,
      sources[variant].fragment,
    )
    assert(!!vertexShader, "Unable to create vertex shader")
    assert(!!fragmentShader, "Unable to create fragment shader")

    this.program = createProgram(gl, vertexShader, fragmentShader)

    this.attributes = attributeNames.reduce(
      (acc, name) => {
        const location = gl.getAttribLocation(this.program, name)
        assert(location !== -1, `Attribute "${name}" not found`)
        acc[name] = location
        return acc
      },
      {} as Record<Attributes, number>,
    )

    this.uniforms = uniformNames.reduce(
      (acc, name) => {
        const location = gl.getUniformLocation(this.program, name)
        assert(!!location, `Uniform "${name}" not found`)
        acc[name] = location
        return acc
      },
      {} as Record<Uniforms, WebGLUniformLocation>,
    )
  }

  use(gl = this.gl) {
    gl.useProgram(this.program)
  }
}

function createShader(
  gl: WebGL2RenderingContext,
  type: number,
  source: string,
) {
  const shader = gl.createShader(type)
  if (!shader) {
    console.error("unable to create shader")
    return null
  }
  gl.shaderSource(shader, source)
  gl.compileShader(shader)

  const success = gl.getShaderParameter(shader, gl.COMPILE_STATUS)
  if (success) {
    return shader
  }

  console.error(gl.getShaderInfoLog(shader))
  gl.deleteShader(shader)
  return null
}

function createProgram(
  gl: WebGL2RenderingContext,
  vertexShader: WebGLShader,
  fragmentShader: WebGLShader,
) {
  const program = gl.createProgram()
  if (!program) {
    throw new Error("Unable to create program")
  }
  gl.attachShader(program, vertexShader)
  gl.attachShader(program, fragmentShader)
  gl.linkProgram(program)

  const success = gl.getProgramParameter(program, gl.LINK_STATUS)
  if (!success) {
    gl.deleteProgram(program)
    throw new Error(
      `Unable to create program: ${gl.getProgramInfoLog(program)}`,
    )
  }

  return program
}

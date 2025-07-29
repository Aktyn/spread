import mainVertexShader from "../assets/shaders/main.vert?raw"
import mainFragmentShader from "../assets/shaders/main.frag?raw"
import combineVertexShader from "../assets/shaders/combine.vert?raw"
import combineFragmentShader from "../assets/shaders/combine.frag?raw"
import { assert } from "@/lib/utils"

export enum ShaderVariant {
  Basic = "basic",
  Combine = "combine",
}

const ShaderConfig: {
  [key in ShaderVariant]: {
    attributes: string[]
    uniforms: string[]
  }
} = {
  [ShaderVariant.Basic]: {
    attributes: ["v_position"],
    uniforms: ["u_texture", "u_transform", "u_camera"],
  },
  [ShaderVariant.Combine]: {
    attributes: ["v_position"],
    uniforms: ["u_background", "u_solid", "u_objects", "u_viewport_scale"],
  },
}

const sources: {
  [key in ShaderVariant]: { vertex: string; fragment: string }
} = {
  [ShaderVariant.Basic]: {
    vertex: mainVertexShader,
    fragment: mainFragmentShader,
  },
  [ShaderVariant.Combine]: {
    vertex: combineVertexShader,
    fragment: combineFragmentShader,
  },
}

export class Shader {
  public readonly program
  public readonly attributes
  public readonly uniforms

  constructor(
    private readonly gl: WebGL2RenderingContext,
    variant: ShaderVariant,
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

    this.attributes = ShaderConfig[variant].attributes.reduce(
      (acc, name) => {
        const location = gl.getAttribLocation(this.program, name)
        assert(location !== -1, `Attribute "${name}" not found`)
        acc[name] = location
        return acc
      },
      {} as Record<string, number>,
    )

    this.uniforms = ShaderConfig[variant].uniforms.reduce(
      (acc, name) => {
        const location = gl.getUniformLocation(this.program, name)
        assert(!!location, `Uniform "${name}" not found`)
        acc[name] = location
        return acc
      },
      {} as Record<string, WebGLUniformLocation>,
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

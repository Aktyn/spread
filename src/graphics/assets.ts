import { Texture } from "./texture"

export class Assets {
  public readonly textures: Record<keyof typeof textureFiles, Texture>

  constructor(gl: WebGL2RenderingContext) {
    this.textures = Object.entries(textureFiles).reduce(
      (acc, [key, path]) => {
        acc[key as keyof typeof textureFiles] = Texture.loadFromFile(gl, path)
        return acc
      },
      {} as typeof this.textures,
    )
  }
}

const textureFiles = {
  player: "/textures/player.png",
}

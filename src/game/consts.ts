export const Consts = {
  /**
   * Important note!\
   * This value defines one unit in rendering scale\
   * Object with width=1 and height=1 will be rendered exactly as square with TILE_SIZExTILE_SIZE resolution, assuming default camera zoom
   * */
  TILE_RESOLUTION: 64,

  Z_INDEX: {
    BACKGROUND_TILE: 0,
    COLLISION_TILE: 1,
    PLAYER: 2,
  },
} as const

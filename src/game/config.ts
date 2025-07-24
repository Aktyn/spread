export const defaultGameConfig = {
  /** Manhattan distance from player or camera center at which objects are updated */
  worldUpdateManhattanDistance: 64,

  /**
   * Minimum manhattan distance from player or camera center at which all tiles are ready\
   * If there is a loading data with this distance, game should be suspended
   */
  minimumReadyTilesManhattanDistance: 4,
}

export type GameConfig = typeof defaultGameConfig

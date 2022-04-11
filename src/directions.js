export const Directions = {
    NORTH: 0,
    NORTH_EAST: 1,
    EAST: 2,
    SOUTH_EAST: 3,
    SOUTH: 4,
    SOUTH_WEST: 5,
    WEST: 6,
    NORTH_WEST: 7,
};

export const DirectionOffsets = [
    [0, 1], // North
    [1, 1], // North-East
    [1, 0], // East
    [1, -1], // South-East
    [0, -1], // South
    [-1, -1], // South-West
    [-1, 0], // West
    [-1, 1], // North-West
];

export const DirectionNames = [
    "NORTH",
    "NORTH_EAST",
    "EAST",
    "SOUTH_EAST",
    "SOUTH",
    "SOUTH_WEST",
    "WEST",
    "NORTH_WEST",
];

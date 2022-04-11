import { TRACE_RUNES } from "./config.js";
import { BANK } from "./bank.js";
import { Directions, DirectionOffsets, DirectionNames } from "./directions.js";
import { Packet } from "./packet.js";


class Rune {
    get type() { return "Rune"; }
    get icon() { return "fa/sparkles.svg"; }

    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.sprite = null;
        this.board = null;
    }

    get neighbors() {
        const offsets = { NORTH: [0, 1], EAST: [1, 0], SOUTH: [0, -1], WEST: [-1, 0] };
        const neighbors = {};
        for (let [direction, offset] of Object.entries(offsets)) {
            const board_key = `${this.x + offset[0]},${this.y + offset[1]}`;
            const neighbor = this.board.runes[board_key];
            if (neighbor) {
                neighbors[direction] = neighbor;
            }
        }
        return neighbors;
    }

    pass(packet, direction, distance) {
        if (typeof distance === "undefined") {
            distance = 1;
        }
        const offset = DirectionOffsets[direction];
        const board_key = `${this.x + (offset[0] * distance)},${this.y + (offset[1] * distance)}`;
        const rune = this.board.runes[board_key];
        if (rune) {
            packet.visit(rune, direction);
        }
    }

    onCreate() { }

    onReceive(packet, direction) {
        if (TRACE_RUNES) {
            console.log(`Receive - ${DirectionNames[direction]} - ${this.x},${this.y} - ${this.type}:${this.constructor.name}`, packet.resources);
        }
    }

    onCast() {
        if (TRACE_RUNES) {
            console.log(`Cast - ${this.x},${this.y} - ${this.type}:${this.constructor.name}`);
        }
    }
}


class EmitterRune extends Rune {
    get type() { return "Emitter"; }
}


class DirectionalRune extends Rune {
    constructor(x, y) {
        super(x, y);
        this._direction = Directions.NORTH;
    }

    onCreate() {
        super.onCreate();
        this.sprite.interactive = true;
        this.sprite.on("click", () => {
            this.direction = (this.direction + 1) % 8;
        });
    }

    get direction() {
        return this._direction;
    }

    set direction(val) {
        this._direction = val;
        this.sprite.angle = (360 / 8) * this._direction;
    }
}


export class VoidRune extends Rune {
    get icon() { return "fa/arrows-to-dot.svg"; }

    onReceive(packet, direction) {
        super.onReceive(packet, direction);
        BANK.add(packet.resources);
    }
}


export class ManaEmitterRune extends EmitterRune {
    get icon() { return "fa/circle-quarters.svg"; }
    onCast() {
        super.onCast();
        for (let [direction, neighbor] of Object.entries(this.neighbors)) {
            const packet = new Packet({ mana: 1 });
            packet.visit(neighbor, Directions[direction]);
        }
    }
}


export class TransmitRune extends DirectionalRune {
    get icon() { return "fa/arrow-up-long.svg"; }

    onReceive(packet, direction) {
        super.onReceive(packet, direction);
        this.pass(packet, this.direction);
    }
}


export class AmplifierRune extends Rune {
    get icon() { return "fa/arrows-repeat-1.svg"; }

    onReceive(packet, direction) {
        super.onReceive(packet, direction);
        const amplified_packet = packet.copy();
        for (let resource of Object.keys(amplified_packet.resources)) {
            amplified_packet.resources[resource] += 1;
        }
        this.pass(amplified_packet, direction);
    }
}

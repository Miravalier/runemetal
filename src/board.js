import { Sprite } from "./gui.js";
import { RUNE_SCALE, RUNE_COLOR } from "./config.js";


export class Board {
    constructor(stage, options) {
        this.stage = stage;
        this.x = options.x;
        this.y = options.y;
        this.height = options.height;
        this.width = options.width;
        this.runes = {};
        this.emitters = new Set();
        this.tile_min = { x: 0, y: 0 };
        this.tile_max = { x: 0, y: 0 };
        this.container = new PIXI.Container();
        this.stage.addChild(this.container);
        this.origin = {
            x: this.x + Math.round(this.width / 2),
            y: this.y + Math.round(this.height / 2)
        };
    }

    async addRune(rune) {
        // Store rune
        const board_key = `${rune.x},${rune.y}`;
        this.runes[board_key] = rune;
        if (rune.type === "Emitter") {
            this.emitters.add(rune);
        }
        rune.board = this;
        // Update bounds
        if (rune.x < this.tile_min.x) {
            this.tile_min.x = rune.x;
        }
        if (rune.y < this.tile_min.y) {
            this.tile_min.y = rune.y;
        }
        if (rune.x > this.tile_max.x) {
            this.tile_max.x = rune.x;
        }
        if (rune.y > this.tile_max.y) {
            this.tile_max.y = rune.y;
        }
        // Render rune sprite
        rune.sprite = await Sprite(rune.icon);
        rune.sprite.pivot.set(rune.sprite.width / 2, rune.sprite.height / 2);
        rune.sprite.x = this.origin.x + (RUNE_SCALE * rune.x);
        rune.sprite.y = this.origin.y - (RUNE_SCALE * rune.y);
        rune.sprite.width = RUNE_SCALE;
        rune.sprite.height = RUNE_SCALE;
        rune.sprite.tint = RUNE_COLOR;
        rune.onCreate(this);
        this.container.addChild(rune.sprite);
        return rune;
    }

    async cast() {
        for (let rune of this.emitters) {
            rune.onCast(this);
        }
    }
}

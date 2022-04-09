const TEXT_COLOR = 0xffffff;
const WINDOW_COLOR = 0xffffff;
const RUNE_COLOR = 0x340d66;
const RUNE_SCALE = 50;
const BUTTON_WIDTH = 100;
const BUTTON_HEIGHT = 24;


async function Sprite(resource) {
    const texture = await PIXI.Texture.fromURL(resource);
    return new PIXI.Sprite(texture);
}


async function DraggableSprite(resource) {
    const sprite = await Sprite(resource);
    sprite.interactive = true;

    let dragging = false;
    let x = null;
    let y = null;

    sprite.on('mousedown', (event) => {
        dragging = true;
        x = event.data.global.x;
        y = event.data.global.y;
    });

    sprite.on('mousemove', (event) => {
        // Make sure currently dragging this object
        if (!dragging || x === null || y === null) {
            return;
        }

        // Emit drag event
        const deltaX = event.data.global.x - x;
        const deltaY = event.data.global.y - y;
        sprite.emit("drag", { x: deltaX, y: deltaY });

        // Update position
        x = event.data.global.x;
        y = event.data.global.y;
    });

    sprite.on('mouseup', () => {
        dragging = false;
        x = null;
        y = null;
    });

    sprite.on('mouseupoutside', () => {
        dragging = false;
        x = null;
        y = null;
    });

    return sprite;
}


function Button(stage, options) {
    // Create container
    const container = new PIXI.Container();
    container.x = options.x - Math.round(options.width / 2);
    container.y = options.y - Math.round(options.height / 2);
    // Add rectangle
    const rect = new PIXI.Graphics();
    rect.lineStyle({ width: 2, color: WINDOW_COLOR, alpha: 0.7 });
    rect.beginFill(WINDOW_COLOR, 0.5);
    rect.drawRoundedRect(0, 0, options.width, options.height, 12);
    container.addChild(rect);
    rect.interactive = true;
    rect.buttonMode = true;
    // Add text
    const text = new PIXI.Text(options.text, {
        fontFamily: 'Raleway',
        fontSize: 24,
        fill: RUNE_COLOR,
        dropShadow: true,
        dropShadowDistance: 1
    });
    text.x = (options.width - text.width) / 2;
    text.y = (options.height - text.height) / 2;
    container.addChild(text);
    // Highlight when moused over
    rect.on("pointerover", () => {
        container.filters = [
            new PIXI.filters.GlowFilter({ distance: 2, outerStrength: 2 })
        ];
    });
    rect.on("pointerout", () => {
        container.filters = [];
    });
    // Propagate click event from rect to container
    rect.on("click", (event) => {
        container.emit("click", event);
    });
    // Add container to stage
    stage.addChild(container);
    return container;
}


class Rune {
    get type() { return "Rune"; }
    get resource() { return "fa/sparkles.svg"; }

    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.sprite = null;
    }

    onCast() {
        console.log(this.type, this.x, this.y);
    }
}


class UnusedRune extends Rune {
    get type() { return "UnusedRune"; }
    get resource() { return "fa/asterisk.svg"; }
}


class Board {
    constructor(stage, options) {
        this.stage = stage;
        this.x = options.x;
        this.y = options.y;
        this.height = options.height;
        this.width = options.width;
        this.runes = {};
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
        rune.sprite = await Sprite(rune.resource);
        rune.sprite.x = this.origin.x + (RUNE_SCALE * rune.x) - Math.round(RUNE_SCALE / 2);
        rune.sprite.y = this.origin.y + (RUNE_SCALE * rune.y) - Math.round(RUNE_SCALE / 2);
        rune.sprite.width = RUNE_SCALE;
        rune.sprite.height = RUNE_SCALE;
        rune.sprite.tint = RUNE_COLOR;
        this.container.addChild(rune.sprite);
    }

    async cast() {
        for (let rune of Object.values(this.runes)) {
            rune.onCast();
        }
    }
}


$(async () => {
    // Determine screen real estate
    const canvas_width = Math.max($(window).width(), 800);
    const canvas_height = Math.max($(window).height(), 800);
    console.log("Canvas Size", { width: canvas_width, height: canvas_height });

    const board_width = Math.floor(canvas_width / RUNE_SCALE) * RUNE_SCALE;
    const board_height = Math.floor((canvas_height / RUNE_SCALE) - 2) * RUNE_SCALE;
    console.log("Board Size", { width: board_width, height: board_height });

    // Create app
    const app = new PIXI.Application({ width: canvas_width, height: canvas_height, backgroundColor: 0x000000 });
    document.body.appendChild(app.view);

    // Add background
    const background = await Sprite('space.jpg');
    const scale = Math.max(canvas_width / background.texture.width, canvas_height / background.texture.height);
    background.scale.set(scale, scale);
    background.x = Math.round((canvas_width - background.width) / 2);
    background.y = Math.round((canvas_height - background.height) / 2);
    app.stage.addChild(background);

    // Find board dimensions
    const board_x = Math.round((canvas_width - board_width) / 2);
    const board_y = Math.round((canvas_height - board_height) / 2) - RUNE_SCALE;

    // Add translucent board
    const rect = new PIXI.Graphics();
    rect.lineStyle({ width: 2, color: WINDOW_COLOR, alpha: 0.5 });
    rect.beginFill(WINDOW_COLOR, 0.3);
    rect.drawRoundedRect(board_x, board_y, board_width, board_height, 4);
    app.stage.addChild(rect);

    // Add board and starting runes
    const board = new Board(app.stage, { x: board_x, y: board_y, width: board_width, height: board_height });
    await board.addRune(new UnusedRune(0, 0));
    await board.addRune(new UnusedRune(0, 1));
    await board.addRune(new UnusedRune(0, -1));
    await board.addRune(new UnusedRune(1, 0));
    await board.addRune(new UnusedRune(-1, 0));

    // Add cast button
    const cast_button = Button(app.stage, {
        text: "Cast",
        width: BUTTON_WIDTH,
        height: BUTTON_HEIGHT,
        x: Math.round(canvas_width / 2),
        y: board_y + board_height + BUTTON_HEIGHT
    });
    cast_button.on("click", () => {
        board.cast();
    });

    /*
    // Create sprites
    let sprite = PIXI.Sprite.from('favicon.svg');
    app.stage.addChild(sprite);

    let sprite2 = PIXI.Sprite.from('fa/acorn.svg');
    sprite2.x = 200;
    app.stage.addChild(sprite2);

    // Add a variable to count up the seconds our demo has been running
    let elapsed = 0.0;
    // Tell our application's ticker to run a new callback every frame, passing
    // in the amount of time that has passed since the last tick
    app.ticker.add((delta) => {
        // Add the time to our total elapsed time
        elapsed += delta;
        // Update the sprite's X position based on the cosine of our elapsed time.  We divide
        // by 50 to slow the animation down a bit...
        sprite.x = 100.0 + Math.cos(elapsed / 50.0) * 100.0;
    });
    */
});

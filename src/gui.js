import { RUNE_COLOR, WINDOW_COLOR } from "./config.js";


export async function Sprite(icon) {
    const texture = await PIXI.Texture.fromURL(icon);
    return new PIXI.Sprite(texture);
}


export async function DraggableSprite(icon) {
    const sprite = await Sprite(icon);
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


export function Button(stage, options) {
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

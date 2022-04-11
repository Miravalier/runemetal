import { RUNE_SCALE, WINDOW_COLOR } from "./config.js";
import { Board } from "./board.js";
import { Sprite, Button } from "./gui.js";
import { VoidRune, ManaEmitterRune, TransmitRune } from "./runes.js";
import { BANK } from "./bank.js";
import { Directions } from "./directions.js";


// Main function
$(async () => {
    // Expose Bank for debugging
    window.BANK = BANK;

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

    await board.addRune(new ManaEmitterRune(0, 0));

    const north_transmit = await board.addRune(new TransmitRune(0, 1));
    north_transmit.direction = Directions.SOUTH_EAST;

    const south_transmit = await board.addRune(new TransmitRune(0, -1));
    south_transmit.direction = Directions.NORTH_WEST;

    await board.addRune(new VoidRune(1, 0));
    await board.addRune(new VoidRune(-1, 0));

    // Add cast button
    const BUTTON_WIDTH = 100;
    const BUTTON_HEIGHT = 24;
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

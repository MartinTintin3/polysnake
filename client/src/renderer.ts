import * as config from "../../shared/constants";
import { GameState } from "../../shared/types";

export default class Renderer {
	ctx: CanvasRenderingContext2D;

	constructor(public canvas: HTMLCanvasElement) {
		this.canvas.width = window.innerWidth;
		this.canvas.height = window.innerHeight;
		this.ctx = this.canvas.getContext("2d")!;
	}

	render(state: GameState) {
		this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
		for (const [, snake] of state.players) {
			if (snake) {
				this.ctx.fillStyle = snake.color;
				for (const block of snake.blocks) {
					this.ctx.fillRect(block.x * 10, block.y * 10, 10, 10);
				}
			}
		}
		this.ctx.fillStyle = "red";
		this.ctx.fillRect(state.food.x * 10, state.food.y * 10, 10, 10);

		// stroke rect
		this.ctx.strokeStyle = "black";
		this.ctx.lineWidth = 1;
		this.ctx.strokeRect(0, 0, config.GAME_WIDTH * 10, config.GAME_HEIGHT * 10);

		// draw names
		this.ctx.fillStyle = "black";
		this.ctx.font = "20px Arial";
		for (const [, snake] of state.players) {
			if (snake) {
				this.ctx.fillText(snake.name, snake.blocks[0].x * 10, snake.blocks[0].y * 10 - 10);
			}
		}
	}
}
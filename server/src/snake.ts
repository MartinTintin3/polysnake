import { DEFAULT_SNAKE_LENGTH, GAME_HEIGHT, GAME_WIDTH } from "../../shared/constants";
import { Direction, GameState, Snake, Vector2 } from "../../shared/types";

export default class ServerSnake extends Snake {
	last_update = Date.now();

	move(state: GameState) {
		const now = Date.now();
		if (now - this.last_update > 1000 / this.speed) {
			// calculate how many blocks could have travelled in the time since the last update
			const change = Math.floor((now - this.last_update) / (1000 / this.speed));
			this.last_update = now;

			for (let j = 0; j < change; j++) {
				const initial_head_pos = { x: this.blocks[0].x, y: this.blocks[0].y };

				switch (this.direction) {
					case Direction.UP:
						this.blocks[0].y--;
						break;
					case Direction.DOWN:
						this.blocks[0].y++;
						break;
					case Direction.LEFT:
						this.blocks[0].x--;
						break;
					case Direction.RIGHT:
						this.blocks[0].x++;
						break;
				}

				const last_pos = { ...this.blocks[this.blocks.length - 1] };

				for (let i = this.blocks.length - 1; i > 1; i--) {
					this.blocks[i].x = this.blocks[i - 1].x;
					this.blocks[i].y = this.blocks[i - 1].y;
				}

				this.blocks[1].x = initial_head_pos.x;
				this.blocks[1].y = initial_head_pos.y;

				if (this.blocks[0].x == state.food.x && this.blocks[0].y == state.food.y) {
					this.blocks.push(new Vector2(last_pos.x, last_pos.y));
				}
			}
		}
	}

	checkCollision(state: GameState, myId: string): boolean {
		if (this.blocks[0].x < 0 || this.blocks[0].x >= GAME_WIDTH || this.blocks[0].y < 0 || this.blocks[0].y >= GAME_HEIGHT) {
			return true;
		}

		for (const [id, snake] of state.players) {
			if (snake && id != myId) {
				for (const block of snake.blocks) {
					if (block.x == this.blocks[0].x && block.y == this.blocks[0].y) {
						return true;
					}
				}
			} else if (id == myId) {
				for (let i = 1; i < this.blocks.length; i++) {
					if (this.blocks[i].x == this.blocks[0].x && this.blocks[i].y == this.blocks[0].y) {
						return true;
					}
				}
			}
		}

		return false;
	}

	validDirectionChange(newDirection: Direction): boolean {
		switch (this.direction) {
			case Direction.UP:
				return newDirection != Direction.DOWN;
			case Direction.DOWN:
				return newDirection != Direction.UP;
			case Direction.LEFT:
				return newDirection != Direction.RIGHT;
			case Direction.RIGHT:
				return newDirection != Direction.LEFT;
		}
	}

	static validSpawnPosition(state: GameState, position: Vector2, direction: Direction): boolean {
		if (position.x < 0 || position.x >= GAME_WIDTH || position.y < 0 || position.y >= GAME_HEIGHT) {
			return false;
		}

		// check if the last block would be out of bounds (based on DEFAULT_SNAKE_LENGTH and direction)
		switch (direction) {
			case Direction.UP:
				if (position.y + DEFAULT_SNAKE_LENGTH >= GAME_HEIGHT) {
					return false;
				}
				break;
			case Direction.DOWN:
				if (position.y - DEFAULT_SNAKE_LENGTH < 0) {
					return false;
				}
				break;
			case Direction.LEFT:
				if (position.x + DEFAULT_SNAKE_LENGTH >= GAME_WIDTH) {
					return false;
				}
				break;
			case Direction.RIGHT:
				if (position.x - DEFAULT_SNAKE_LENGTH < 0) {
					return false;
				}
				break;
		}

		for (const [, snake] of state.players) {
			if (snake) {
				for (const block of snake.blocks) {
					if (block.x == position.x && block.y == position.y) {
						return false;
					}

					if (direction == Direction.UP && block.x == position.x && block.y == position.y + 1) {
						return false;
					} else if (direction == Direction.DOWN && block.x == position.x && block.y == position.y - 1) {
						return false;
					} else if (direction == Direction.LEFT && block.x == position.x + 1 && block.y == position.y) {
						return false;
					} else if (direction == Direction.RIGHT && block.x == position.x - 1 && block.y == position.y) {
						return false;
					}
				}
			}
		}

		return true;
	}

	static findSpawnPosition(state: GameState, direction: Direction): Vector2 {
		let x = Math.floor(Math.random() * GAME_WIDTH);
		let y = Math.floor(Math.random() * GAME_HEIGHT);

		while (!ServerSnake.validSpawnPosition(state, new Vector2(x, y), direction)) {
			x = Math.floor(Math.random() * GAME_WIDTH);
			y = Math.floor(Math.random() * GAME_HEIGHT);
		}

		return new Vector2(x, y);
	}

	static generateSnakeBody(direction: Direction, head: Vector2): Vector2[] {
		const body = [head];
		for (let i = 1; i < DEFAULT_SNAKE_LENGTH; i++) {
			switch (direction) {
				case Direction.UP:
					body.push(new Vector2(head.x, head.y + i));
					break;
				case Direction.DOWN:
					body.push(new Vector2(head.x, head.y - i));
					break;
				case Direction.LEFT:
					body.push(new Vector2(head.x + i, head.y));
					break;
				case Direction.RIGHT:
					body.push(new Vector2(head.x - i, head.y));
					break;
			}
		}
		return body;
	}
}
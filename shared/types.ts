import { Reader, Writer } from "./buffer";
import { DEFAULT_SNAKE_SPEED } from "./constants";

export type Nullable<T> = T | null;
export type Optional<T> = T | undefined;

export class Vector2 implements Writable {
	static readonly SIZE = 4 + 4;

	constructor(public x: number, public y: number) { }

	getSize(): number {
		return Vector2.SIZE;
	}

	write(writer: Writer): Writer {
		writer.writeUint32(this.x);
		writer.writeUint32(this.y);
		return writer;
	}

	static read(reader: Reader): Vector2 {
		return new Vector2(reader.readUint32(), reader.readUint32());
	}
}

export class Snake implements Writable {
	constructor(public name: string, public color: string, public blocks: Vector2[], public direction: Direction = Direction.RIGHT, public speed = DEFAULT_SNAKE_SPEED) { }

	getSize(): number {
		// name length + name + color length + color + direction + speed (4 bytes)
		let size = 4 + this.name.length + 4 + this.color.length + 1 + 4;
		size += 4; // blocks length
		for (const block of this.blocks) {
			size += block.getSize();
		}
		return size;
	}

	write(writer: Writer): Writer {
		writer.writeString(this.name);
		writer.writeString(this.color);
		writer.writeUint8(this.direction);
		writer.writeUint32(this.speed);

		writer.writeUint32(this.blocks.length);
		for (const block of this.blocks) {
			block.write(writer);
		}
		return writer;
	}

	static read(reader: Reader): Snake {
		const name = reader.readString();
		const color = reader.readString();
		const direction = reader.readUint8();
		const speed = reader.readUint32();

		const numBlocks = reader.readUint32();
		const blocks: Vector2[] = [];
		for (let i = 0; i < numBlocks; i++) {
			blocks.push(Vector2.read(reader));
		}
		return new Snake(name, color, blocks, direction, speed);
	}
}

export class GameState implements Writable {
	constructor(public players: Map<string, Nullable<Snake>>, public food: Vector2) { }

	getSize(): number {
		// snake length + snakes + food
		let size = 4;
		for (const [id, snake] of this.players) {
			size += 4 + id.length + 1 + (snake ? snake.getSize() : 0);
		}
		size += this.food.getSize();
		return size;
	}

	write(writer: Writer): Writer {
		writer.writeUint32(this.players.size);
		for (const [id, snake] of this.players) {
			writer.writeString(id);
			writer.writeUint8(snake ? 1 : 0);
			if (snake) {
				snake.write(writer);
			}
		}
		this.food.write(writer);
		return writer;
	}

	static read(reader: Reader): GameState {
		const numPlayers = reader.readUint32();
		const players = new Map<string, Nullable<Snake>>();
		for (let i = 0; i < numPlayers; i++) {
			const id = reader.readString();
			players.set(id, reader.readUint8() ? Snake.read(reader) : null);
		}
		const food = Vector2.read(reader);
		return new GameState(players, food);
	}
}

export type Block = Vector2;

export enum C2SPacketType {
	JOIN = 0x00,
	CHANGE_DIRECTION = 0x01,
}

export enum S2CPacketType {
	JOIN = 0x00,
	GAME_STATE = 0x01,
	DEATH = 0x02,
}

export enum Direction {
	UP = 0x00,
	DOWN = 0x01,
	LEFT = 0x02,
	RIGHT = 0x03,
}

export interface IPacket {
	type: C2SPacketType | S2CPacketType;
}

export interface Writable {
	getSize(): number;
	write(writer: Writer): Writer;
}

export class Packet implements IPacket, Writable {
	type: C2SPacketType | S2CPacketType;

	constructor(type: C2SPacketType | S2CPacketType) {
		this.type = type;
	}

	getSize(): number {
		throw new Error("Method not implemented.");
	}

	write(writer: Writer): Writer {
		throw new Error("Method not implemented.");
	}

	serialize(): ArrayBuffer {
		const writer = Writer.fromSize(this.getSize());
		return this.write(writer).buffer;
	}
	
	static read(reader: Reader): Packet {
		throw new Error("Method not implemented.");
	}
}
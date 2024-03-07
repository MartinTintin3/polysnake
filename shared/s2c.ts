// S2C Packets

import { v4 } from "uuid";

import { Block, Direction, GameState, IPacket, Packet, S2CPacketType, Snake, Vector2 } from "./types";
import { Writer, Reader } from "./buffer";

export class S2CJoinPacket extends Packet {
	constructor(public id: string) {
		super(S2CPacketType.JOIN);
	}

	override getSize(): number {
		return 1 + this.id.length;
	}

	override write(writer: Writer): Writer {
		writer.writeUint8(this.type);
		writer.writeString(this.id);
		return writer;
	}

	static override read(reader: Reader): S2CJoinPacket {
		return new S2CJoinPacket(reader.readString());
	}
}

export class S2CGameStatePacket extends Packet {
	constructor(public state: GameState) {
		super(S2CPacketType.GAME_STATE);
	}

	override getSize(): number {
		let size = 1 + this.state.getSize();
		return size;
	}

	override write(writer: Writer): Writer {
		writer.writeUint8(this.type);
		this.state.write(writer);
		return writer;
	}

	static override read(reader: Reader): S2CGameStatePacket {
		return new S2CGameStatePacket(GameState.read(reader));
	}
}

export default class S2CDeathPacket extends Packet {
	constructor() {
		super(S2CPacketType.DEATH);
	}

	override getSize(): number {
		return 1;
	}

	override write(writer: Writer): Writer {
		writer.writeUint8(this.type);
		return writer;
	}

	static override read(reader: Reader): S2CDeathPacket {
		return new S2CDeathPacket();
	}
}
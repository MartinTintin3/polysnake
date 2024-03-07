// C2S packets

import { Direction, IPacket, C2SPacketType, Packet } from "./types";
import { Writer, Reader } from "./buffer";

export class C2SJoinPacket extends Packet {
	constructor(public name: string) {
		super(C2SPacketType.JOIN);
	}

	/**
	 * | Type | Size | Description |
	 * | :--- | :--- | :--- |
	 * | Uint8 | 1 | Packet type |
	 * | Uint32 | 4 | Name length |
	 * | String | Name length | Name |
	 * @returns The total size of the packet in bytes
	 */
	override getSize(): number {
		return 1 + 4 + this.name.length;
	}

	override write(writer: Writer): Writer {
		writer.writeUint8(this.type);
		writer.writeString(this.name);
		return writer;
	}

	/**
	 * Assumes the packet type (first uint8) is already read
	 */
	static override read(reader: Reader): C2SJoinPacket {
		return new C2SJoinPacket(reader.readString());
	}
}

export class C2SChangeDirectionPacket extends Packet {
	constructor(public direction: Direction) {
		super(C2SPacketType.CHANGE_DIRECTION);
	}

	override getSize(): number {
		return 1 + 1;
	}

	override write(writer: Writer): Writer {
		writer.writeUint8(this.type);
		writer.writeUint8(this.direction);
		return writer;
	}

	static override read(reader: Reader): C2SChangeDirectionPacket {
		return new C2SChangeDirectionPacket(reader.readUint8());
	}
}
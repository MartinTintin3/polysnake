export class Writer {
	buffer: ArrayBuffer;
	view: DataView;
	offset: number;

	constructor(buffer: ArrayBuffer) {
		this.buffer = buffer;
		this.view = new DataView(buffer);
		this.offset = 0;
	}

	static fromSize(size: number) {
		return new Writer(new ArrayBuffer(size));
	}

	writeUint8(value: number) {
		this.view.setUint8(this.offset, value);
		this.offset += 1;
	}

	writeInt8(value: number) {
		this.view.setInt8(this.offset, value);
		this.offset += 1;
	}

	writeUint16(value: number) {
		this.view.setUint16(this.offset, value);
		this.offset += 2;
	}

	writeInt16(value: number) {
		this.view.setInt16(this.offset, value);
		this.offset += 2;
	}

	writeUint32(value: number) {
		this.view.setUint32(this.offset, value);
		this.offset += 4;
	}

	writeInt32(value: number) {
		this.view.setInt32(this.offset, value);
		this.offset += 4;
	}

	writeFloat32(value: number) {
		this.view.setFloat32(this.offset, value);
		this.offset += 4;
	}

	writeFloat64(value: number) {
		this.view.setFloat64(this.offset, value);
		this.offset += 8;
	}

	writeString(value: string) {
		const encoder = new TextEncoder();
		const bytes = encoder.encode(value);
		this.writeUint32(bytes.length);
		for (let i = 0; i < bytes.length; i++) {
			this.writeUint8(bytes[i]);
		}
	}

	writeUint8Array(value: Uint8Array) {
		this.writeUint32(value.length);
		for (let i = 0; i < value.length; i++) {
			this.writeUint8(value[i]);
		}
	}

	writeInt8Array(value: Int8Array) {
		this.writeUint32(value.length);
		for (let i = 0; i < value.length; i++) {
			this.writeInt8(value[i]);
		}
	}

	writeUint16Array(value: Uint16Array) {
		this.writeUint32(value.length);
		for (let i = 0; i < value.length; i++) {
			this.writeUint16(value[i]);
		}
	}

	writeInt16Array(value: Int16Array) {
		this.writeUint32(value.length);
		for (let i = 0; i < value.length; i++) {
			this.writeInt16(value[i]);
		}
	}

	writeUint32Array(value: Uint32Array) {
		this.writeUint32(value.length);
		for (let i = 0; i < value.length; i++) {
			this.writeUint32(value[i]);
		}
	}

	writeInt32Array(value: Int32Array) {
		this.writeUint32(value.length);
		for (let i = 0; i < value.length; i++) {
			this.writeInt32(value[i]);
		}
	}

	writeFloat32Array(value: Float32Array) {
		this.writeUint32(value.length);
		for (let i = 0; i < value.length; i++) {
			this.writeFloat32(value[i]);
		}
	}

	writeFloat64Array(value: Float64Array) {
		this.writeUint32(value.length);
		for (let i = 0; i < value.length; i++) {
			this.writeFloat64(value[i]);
		}
	}

	writeArrayBuffer(value: ArrayBuffer) {
		const bytes = new Uint8Array(value);
		this.writeUint32(bytes.length);
		for (let i = 0; i < bytes.length; i++) {
			this.writeUint8(bytes[i]);
		}
	}
}

export class Reader {
	buffer: ArrayBuffer;
	view: DataView;
	offset: number;

	constructor(buffer: ArrayBuffer) {
		this.buffer = buffer;
		this.view = new DataView(buffer);
		this.offset = 0;
	}

	readUint8() {
		const value = this.view.getUint8(this.offset);
		this.offset += 1;
		return value;
	}

	readInt8() {
		const value = this.view.getInt8(this.offset);
		this.offset += 1;
		return value;
	}

	readUint16() {
		const value = this.view.getUint16(this.offset);
		this.offset += 2;
		return value;
	}

	readInt16() {
		const value = this.view.getInt16(this.offset);
		this.offset += 2;
		return value;
	}

	readUint32() {
		const value = this.view.getUint32(this.offset);
		this.offset += 4;
		return value;
	}

	readInt32() {
		const value = this.view.getInt32(this.offset);
		this.offset += 4;
		return value;
	}

	readFloat32() {
		const value = this.view.getFloat32(this.offset);
		this.offset += 4;
		return value;
	}

	readFloat64() {
		const value = this.view.getFloat64(this.offset);
		this.offset += 8;
		return value;
	}

	readString() {
		const length = this.readUint32();
		const bytes = new Uint8Array(this.buffer, this.offset, length);
		this.offset += length;
		const decoder = new TextDecoder();
		return decoder.decode(bytes);
	}

	readUint8Array() {
		const length = this.readUint32();
		const array = new Uint8Array(this.buffer, this.offset, length);
		this.offset += length;
		return array;
	}

	readInt8Array() {
		const length = this.readUint32();
		const array = new Int8Array(this.buffer, this.offset, length);
		this.offset += length;
		return array;
	}

	readUint16Array() {
		const length = this.readUint32();
		const array = new Uint16Array(this.buffer, this.offset, length);
		this.offset += length * 2;
		return array;
	}

	readInt16Array() {
		const length = this.readUint32();
		const array = new Int16Array(this.buffer, this.offset, length);
		this.offset += length * 2;
		return array;
	}

	readUint32Array() {
		const length = this.readUint32();
		const array = new Uint32Array(this.buffer, this.offset, length);
		this.offset += length * 4;
		return array;
	}

	readInt32Array() {
		const length = this.readUint32();
		const array = new Int32Array(this.buffer, this.offset, length);
		this.offset += length * 4;
		return array;
	}

	readFloat32Array() {
		const length = this.readUint32();
		const array = new Float32Array(this.buffer, this.offset, length);
		this.offset += length * 4;
		return array;
	}

	readFloat64Array() {
		const length = this.readUint32();
		const array = new Float64Array(this.buffer, this.offset, length);
		this.offset += length * 8;
		return array;
	}

	readArrayBuffer() {
		const length = this.readUint32();
		const buffer = this.buffer.slice(this.offset, this.offset + length);
		this.offset += length;
		return buffer;
	}
}
import * as config from "../../shared/constants";
import { C2SChangeDirectionPacket, C2SJoinPacket } from "../../shared/c2s";

import { Reader } from "../../shared/buffer";
import { Direction, GameState, S2CPacketType } from "../../shared/types";

import { S2CGameStatePacket, S2CJoinPacket } from "../../shared/s2c";
import Renderer from "./renderer";

const ws = new WebSocket(`ws://${window.location.host}${config.SOCKET_PATH}`);

const renderer = new Renderer(document.getElementById("canvas") as HTMLCanvasElement);

let state: GameState | null = null;

ws.addEventListener("open", () => {
	console.log("Connected to server");

	// random nam
	const packet = new C2SJoinPacket(prompt("Nickname"));
	ws.send(packet.serialize());
});

ws.addEventListener("message", (event) => {
	if (event.data instanceof Blob) {
		event.data.arrayBuffer().then((buffer) => {
			const reader = new Reader(buffer);

			switch (reader.readUint8() as S2CPacketType) {
				case S2CPacketType.GAME_STATE: {
					state = S2CGameStatePacket.read(reader).state;
					break;
				}
				case S2CPacketType.JOIN: {
					const packet = S2CJoinPacket.read(reader);
					console.log(`Player joined with id: ${packet.id}`);
					break;
				}
				case S2CPacketType.DEATH: {
					console.log("You died");
					break;
				}
				default: {
					console.error("Unknown packet type: ", buffer);

					break;
				}
			}
		});
	}
});

ws.addEventListener("close", () => {
	console.log("Disconnected from server");
});

ws.addEventListener("error", (event) => {
	console.error(event);
});

requestAnimationFrame(function render() {
	if (state) {
		renderer.render(state);
	}
	requestAnimationFrame(render);
});

document.addEventListener("keydown", e => {
	if (e.repeat) return;

	let preventDefault = true;

	switch (e.key) {
		case "ArrowUp":
			ws.send(new C2SChangeDirectionPacket(Direction.UP).serialize());
			break;
		case "ArrowDown":
			ws.send(new C2SChangeDirectionPacket(Direction.DOWN).serialize());
			break;
		case "ArrowLeft":
			ws.send(new C2SChangeDirectionPacket(Direction.LEFT).serialize());
			break;
		case "ArrowRight":
			ws.send(new C2SChangeDirectionPacket(Direction.RIGHT).serialize());
			break;
		default:
			preventDefault = false;
	}

	if (preventDefault) {
		e.preventDefault();
	}
});
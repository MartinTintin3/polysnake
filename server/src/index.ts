import http from "http";
import express from "express";
import { WebSocket, WebSocketServer } from "ws";
import { v4 } from "uuid";

import { Reader, Writer } from "../../shared/buffer";
import { C2SPacketType, GameState, Nullable, Snake, Vector2 } from "../../shared/types";

import { C2SJoinPacket } from "../../shared/c2s";
import S2CDeathPacket, { S2CGameStatePacket } from "../../shared/s2c";

import * as config from "../../shared/constants";
import ServerSnake from "./snake";

const app = express();
const server = http.createServer(app);

app.use(express.static("dist/client"));

const wss = new WebSocketServer({ server, path: config.SOCKET_PATH });

server.listen(config.HTTP_PORT, () => {
	console.log(`Server listening on *:${config.HTTP_PORT}`);
});

const gameState = new GameState(new Map<string, Nullable<ServerSnake>>(), new Vector2(10, 10));

const connections = new Map<string, WebSocket>();

const broadcastGameState = () => {
	const packet = new S2CGameStatePacket(gameState);
	const buffer = packet.serialize();

	connections.forEach((connection, id) => {
		if (gameState.players.get(id) != null) {
			connection.send(buffer);
		}
	});
}

setInterval(() => {
	// Update game state
	for (const [id, snake] of gameState.players as Map<string, Nullable<ServerSnake>>) {
		if (snake) {
			snake.move(gameState);

			if (snake.checkCollision(gameState, id)) {
				gameState.players.delete(id);
				connections.get(id)?.send(new S2CDeathPacket().serialize());
			}
		}
	}

	broadcastGameState();
}, 1000 / 10);

wss.on("connection", ws => {
	console.log("Client connected");

	const id = v4();
	connections.set(id, ws);
	gameState.players.set(id, null);

	ws.send(new C2SJoinPacket(id).serialize());

	ws.send(new S2CGameStatePacket(gameState).serialize());

	ws.on("message", message => {
		if (message instanceof Buffer) {
			const arrayBuffer = message.buffer.slice(message.byteOffset, message.byteOffset + message.byteLength)
			const reader = new Reader(arrayBuffer);

			switch (reader.readUint8() as C2SPacketType) {
				case C2SPacketType.JOIN: {
					const packet = C2SJoinPacket.read(reader);
					console.log(`Player joined with name: ${packet.name}`);

					const direction = Math.floor(Math.random() * 4);

					gameState.players.set(id, new ServerSnake(packet.name, /* random color*/ "blue", ServerSnake.generateSnakeBody(direction, ServerSnake.findSpawnPosition(gameState, direction)), direction));
					break;
				}
				case C2SPacketType.CHANGE_DIRECTION: {
					const direction = reader.readUint8();
					const snake = gameState.players.get(id) as Nullable<ServerSnake>;
					if (snake && snake.validDirectionChange(direction)) {
						snake.direction = direction;
					}
					break;
				
				}
				default: {
					console.error("Unknown packet type", { message });
					break;
				}
			}
		}
	});

	ws.on("close", () => {
		connections.delete(id);
		gameState.players.delete(id);
	});

	ws.send("Hello, client!");
});
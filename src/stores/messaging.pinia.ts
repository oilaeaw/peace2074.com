import { defineStore } from "pinia";
import { computed, ref } from "vue";

// ─── Types ────────────────────────────────────────────────────────────────────

export type WsMessageType =
    | "server:id"
    | "health"
    | "server:ack"
    | "chat:message"
    | "history"
    | "user-list"
    | "user-joined"
    | "user-left";

export interface WsEnvelope {
    type: WsMessageType | string;
    id?: string;
    text?: string;
    author?: string;
    from?: string;
    to?: string;
    room?: string;
    ts?: string;
    users?: string[];
    messages?: ChatMessage[];
    payload?: unknown;
    data?: unknown;
    received?: boolean;
    ok?: boolean;
    error?: string;
    timestamp?: string;
}

export interface ChatMessage {
    id: string;
    type: string;
    from: string;
    to?: string;
    room?: string;
    text: string;
    ts: number;
}

// ─── Config ───────────────────────────────────────────────────────────────────

const env = (import.meta as any)?.env || {};
const DEFAULT_WS_URL: string =
    (env.VITE_MESSAGING_URL as string) || "wss://waelio-messagin-live.onrender.com";
const MAX_MESSAGES = 200;

// ─── Helpers ──────────────────────────────────────────────────────────────────

function makeId(prefix = "msg"): string {
    return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(16).slice(2, 8)}`;
}

function parseTs(ts: string | number | undefined): number {
    if (typeof ts === "number" && Number.isFinite(ts)) return ts;
    if (typeof ts === "string") {
        const n = Number(ts);
        if (Number.isFinite(n) && n > 0) return n;
        const p = Date.parse(ts);
        if (Number.isFinite(p)) return p;
    }
    return Date.now();
}

function normalizeUsers(list: unknown): string[] {
    if (!Array.isArray(list)) return [];
    return [
        ...new Set(
            list.filter((x): x is string => typeof x === "string" && x.trim().length > 0)
        ),
    ];
}

function toMessage(env: WsEnvelope): ChatMessage {
    return {
        id: env.id || makeId("msg"),
        type: env.room || env.to ? (env.to ? "direct" : "broadcast") : "message",
        from: env.from || env.author || "anon",
        to: env.to,
        room: env.room,
        text: env.text || "",
        ts: parseTs(env.ts),
    };
}

// ─── Store ────────────────────────────────────────────────────────────────────

export const useMessagingStore = defineStore("messaging", () => {
    const socket = ref<WebSocket | null>(null);
    const url = ref<string>(DEFAULT_WS_URL);
    const connected = ref(false);
    const connecting = ref(false);
    const error = ref<string | null>(null);
    const messages = ref<ChatMessage[]>([]);
    const users = ref<string[]>([]);
    const me = ref<string | null>(null);
    const currentRoom = ref<string>("general");
    const rooms = ref<string[]>(["general", "support", "dev"]);

    // ── Internal helpers ───────────────────────────────────────────────────

    function send(payload: object): void {
        if (socket.value?.readyState === WebSocket.OPEN) {
            socket.value.send(JSON.stringify(payload));
        }
    }

    function pushMessage(msg: ChatMessage): void {
        const dup = messages.value.some(
            (m) =>
                m.id === msg.id ||
                (m.ts === msg.ts && m.from === msg.from && m.text === msg.text)
        );
        if (dup) return;

        messages.value.push(msg);
        if (messages.value.length > MAX_MESSAGES) {
            messages.value.splice(0, messages.value.length - MAX_MESSAGES);
        }
    }

    function handleMessage(raw: MessageEvent<string>): void {
        let env: WsEnvelope;
        try {
            env = JSON.parse(raw.data) as WsEnvelope;
        } catch {
            console.warn("[messaging] invalid JSON from server");
            return;
        }

        switch (env.type as WsMessageType) {
            case "server:id":
                me.value = env.id || me.value;
                break;

            case "health":
                // heartbeat — nothing to do
                break;

            case "user-list":
                users.value = normalizeUsers(env.users);
                if (me.value && !users.value.includes(me.value)) {
                    users.value = [me.value, ...users.value];
                }
                break;

            case "user-joined": {
                const id = env.id?.trim() ?? "";
                if (id && !users.value.includes(id)) {
                    users.value = [...users.value, id];
                }
                break;
            }

            case "user-left": {
                const id = env.id?.trim() ?? "";
                if (id) users.value = users.value.filter((u) => u !== id);
                break;
            }

            case "chat:message":
                pushMessage(toMessage(env));
                break;

            case "history":
                if (Array.isArray(env.messages)) {
                    messages.value = env.messages
                        .map((m) => toMessage(m as unknown as WsEnvelope))
                        .slice(-MAX_MESSAGES);
                }
                break;

            default:
                // server:ack and unknown types — ignore silently
                break;
        }
    }

    // ── Public API ─────────────────────────────────────────────────────────

    function disconnect(): void {
        if (socket.value) {
            socket.value.onopen = null;
            socket.value.onmessage = null;
            socket.value.onerror = null;
            socket.value.onclose = null;
            if (
                socket.value.readyState === WebSocket.OPEN ||
                socket.value.readyState === WebSocket.CONNECTING
            ) {
                socket.value.close();
            }
            socket.value = null;
        }
        connected.value = false;
        connecting.value = false;
    }

    function connect(nextUrl?: string): void {
        if (typeof window === "undefined") return;

        const target = (nextUrl || url.value || "").trim();
        if (!target) {
            error.value = "Messaging URL missing";
            return;
        }

        if (socket.value) disconnect();

        url.value = target;
        error.value = null;
        connecting.value = true;

        const ws = new WebSocket(target);
        socket.value = ws;

        ws.onopen = (): void => {
            connected.value = true;
            connecting.value = false;
            error.value = null;

            // Request message history
            send({ type: "find:messages" });
        };

        ws.onmessage = handleMessage;

        ws.onerror = (_ev: Event): void => {
            connected.value = false;
            connecting.value = false;
            error.value = "Connection error";
            console.warn("[messaging] WebSocket error");
        };

        ws.onclose = (_ev: CloseEvent): void => {
            const wasConnected = connected.value;
            connected.value = false;
            connecting.value = false;
            socket.value = null;

            if (wasConnected) {
                error.value = "Disconnected from chat server";
            }
        };
    }

    function sendBroadcast(text: string, room?: string): void {
        const body = (text || "").trim();
        if (!body) return;

        if (!socket.value || !connected.value) {
            error.value = "Chat server is not connected";
            return;
        }

        error.value = null;
        send({
            type: "chat:message",
            text: body,
            author: me.value || "anonymous",
            room: room || currentRoom.value || undefined,
        });
    }

    function sendDirect(text: string, to: string): void {
        const body = (text || "").trim();
        if (!body || !to) return;

        if (!socket.value || !connected.value) {
            error.value = "Chat server is not connected";
            return;
        }

        error.value = null;
        send({
            type: "chat:message",
            text: body,
            author: me.value || "anonymous",
            to,
        });
    }

    function requestHistory(): void {
        send({ type: "find:messages" });
    }

    function requestUsers(): void {
        // Server pushes user-list automatically on connect + changes
    }

    function joinRoom(roomName: string): void {
        const room = roomName.trim();
        if (!room) return;
        currentRoom.value = room;
        if (!rooms.value.includes(room)) rooms.value.push(room);
        send({ type: "join:room", room });
    }

    function createRoom(roomName: string): void {
        const room = roomName.trim();
        if (!room || rooms.value.includes(room)) return;
        rooms.value.push(room);
        joinRoom(room);
    }

    // ── Computed ───────────────────────────────────────────────────────────

    const sortedMessages = computed(() =>
        messages.value.slice().sort((a, b) => a.ts - b.ts)
    );

    const roomMessages = computed(() =>
        sortedMessages.value.filter((msg) => {
            if (msg.type === "direct") return true;
            return !msg.room || msg.room === currentRoom.value;
        })
    );

    return {
        url,
        connected,
        connecting,
        error,
        users,
        me,
        currentRoom,
        rooms,
        messages: sortedMessages,
        roomMessages,
        rawMessages: messages,
        connect,
        disconnect,
        sendBroadcast,
        sendDirect,
        requestHistory,
        requestUsers,
        joinRoom,
        createRoom,
    };
});

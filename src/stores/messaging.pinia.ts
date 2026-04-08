import { defineStore } from "pinia";
import { computed, ref } from "vue";
import { io, type Socket } from "socket.io-client";

export type MessagingEnvelope = {
    id?: string;
    type?: string;
    from?: string;
    user?: string;
    sender?: string;
    senderId?: string;
    to?: string;
    recipientId?: string;
    room?: string;
    payload?: unknown;
    text?: string;
    message?: string;
    meta?: unknown;
    ts?: number | string;
    timestamp?: number | string;
    users?: string[];
    history?: unknown[];
    you?: boolean;
    isBroadcast?: boolean;
};

export type ChatMessage = {
    id: string;
    type: string;
    from: string;
    to?: string;
    room?: string;
    text: string;
    payload?: unknown;
    ts: number;
    meta?: unknown;
};

const env = (import.meta as any)?.env || {};
const DEFAULT_MESSAGING_URL =
    (env.VITE_MESSAGING_URL as string) || "https://waelio-messagin-live.onrender.com";
const MAX_MESSAGES = 200;

function makeId(prefix = "msg") {
    return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(16).slice(2, 8)}`;
}

function normalizeTimestamp(value: unknown) {
    if (typeof value === "number" && Number.isFinite(value)) {
        return value;
    }

    if (typeof value === "string") {
        const numeric = Number(value);
        if (Number.isFinite(numeric) && numeric > 0) {
            return numeric;
        }

        const parsed = Date.parse(value);
        if (Number.isFinite(parsed)) {
            return parsed;
        }
    }

    return Date.now();
}

function normalizeUsers(list: unknown) {
    if (!Array.isArray(list)) {
        return [] as string[];
    }

    return [...new Set(list.filter((entry): entry is string => typeof entry === "string" && entry.trim().length > 0))];
}

function normalizeMessage(msg: MessagingEnvelope): ChatMessage {
    const ts = normalizeTimestamp(msg?.ts ?? msg?.timestamp);
    const text =
        (typeof msg?.text === "string" && msg.text) ||
        (typeof msg?.payload === "string" && msg.payload) ||
        (typeof msg?.message === "string" && msg.message) ||
        (typeof msg?.payload === "object" && JSON.stringify(msg.payload)) ||
        "";

    const type =
        msg?.type ||
        (msg?.isBroadcast ? "broadcast" : (msg?.recipientId || msg?.to) ? "direct" : "message");

    return {
        id: msg?.id || makeId("msg"),
        type,
        from: msg?.from || msg?.user || msg?.sender || msg?.senderId || "anon",
        to: msg?.to || msg?.recipientId,
        room: msg?.room,
        text,
        payload: msg?.payload,
        ts,
        meta: msg?.meta,
    };
}

export const useMessagingStore = defineStore("messaging", () => {
    const socket = ref<Socket | null>(null);
    const url = ref<string>(DEFAULT_MESSAGING_URL);
    const connected = ref(false);
    const connecting = ref(false);
    const error = ref<string | null>(null);
    const messages = ref<ChatMessage[]>([]);
    const users = ref<string[]>([]);
    const me = ref<string | null>(null);
    const currentRoom = ref<string>("general");
    const rooms = ref<string[]>(["general", "support", "dev"]);

    function disconnect() {
        try {
            socket.value?.removeAllListeners();
            socket.value?.disconnect();
        } catch { }
        socket.value = null;
        connected.value = false;
        connecting.value = false;
    }

    function pushMessage(message: ChatMessage) {
        const exists = messages.value.some((entry) =>
            entry.id === message.id || (
                entry.ts === message.ts
                && entry.type === message.type
                && entry.from === message.from
                && entry.to === message.to
                && entry.text === message.text
            )
        );

        if (exists) {
            return;
        }

        messages.value.push(message);
        if (messages.value.length > MAX_MESSAGES) {
            messages.value.splice(0, messages.value.length - MAX_MESSAGES);
        }
    }

    function connect(nextUrl?: string) {
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

        const client = io(target, {
            transports: ["websocket", "polling"],
            timeout: 10000,
            reconnection: true,
            reconnectionAttempts: 3,
            withCredentials: false,
        });
        socket.value = client;

        client.on("connect", () => {
            connected.value = true;
            connecting.value = false;
            error.value = null;
            me.value = client.id || me.value;

            requestHistory();
            requestUsers();
        });

        client.on("disconnect", (reason) => {
            connected.value = false;
            connecting.value = false;

            if (reason !== "io client disconnect") {
                error.value = "Disconnected from chat server";
            }
        });

        client.on("connect_error", (err) => {
            connected.value = false;
            connecting.value = false;
            error.value = err?.message ? `Connection error: ${err.message}` : "Connection error";
            console.warn("[messaging] connection failed", err);
        });

        client.on("register-success", (msg: MessagingEnvelope) => {
            if (msg?.id) {
                me.value = msg.id;
            }
        });

        client.on("user-list", (msg: { users?: string[] }) => {
            users.value = normalizeUsers(msg?.users);

            if (me.value && !users.value.includes(me.value)) {
                users.value = [me.value, ...users.value];
            }
        });

        client.on("user-joined", (msg: { id?: string }) => {
            const id = typeof msg?.id === "string" ? msg.id.trim() : "";
            if (id && !users.value.includes(id)) {
                users.value = [...users.value, id];
            }
        });

        client.on("user-left", (msg: { id?: string }) => {
            const id = typeof msg?.id === "string" ? msg.id.trim() : "";
            if (!id) {
                return;
            }

            users.value = users.value.filter((entry) => entry !== id);
        });

        client.on("messages created", (msg: MessagingEnvelope) => {
            pushMessage(normalizeMessage(msg));
        });

        client.on("history", (history: MessagingEnvelope[]) => {
            if (!Array.isArray(history)) {
                return;
            }

            messages.value = history.map((entry) => normalizeMessage(entry)).slice(-MAX_MESSAGES);
        });
    }

    function sendBroadcast(text: string, room?: string) {
        const body = (text || "").trim();
        if (!body) return;

        if (!socket.value || !connected.value) {
            error.value = "Chat server is not connected";
            return;
        }

        error.value = null;
        socket.value.emit("create", "messages", {
            type: "broadcast",
            payload: body,
        }, {});
    }

    function sendDirect(text: string, to: string) {
        const body = (text || "").trim();
        if (!body || !to) return;

        if (!socket.value || !connected.value) {
            error.value = "Chat server is not connected";
            return;
        }

        error.value = null;
        socket.value.emit("create", "messages", {
            type: "route",
            to,
            payload: body,
        }, {});
    }

    function requestHistory() {
        if (!socket.value) {
            return;
        }

        socket.value.emit("find", "messages", {}, (err: unknown, history?: MessagingEnvelope[]) => {
            if (err) {
                console.warn("[messaging] history request failed", err);
                return;
            }

            if (!Array.isArray(history)) {
                messages.value = [];
                return;
            }

            messages.value = history.map((entry) => normalizeMessage(entry)).slice(-MAX_MESSAGES);
        });
    }

    function requestUsers() {
        // The live service pushes user state via the "user-list" event.
    }

    function joinRoom(roomName: string) {
        const room = roomName.trim();
        if (!room) return;
        currentRoom.value = room;
        if (!rooms.value.includes(room)) {
            rooms.value.push(room);
        }
    }

    function createRoom(roomName: string) {
        const room = roomName.trim();
        if (!room || rooms.value.includes(room)) return;
        rooms.value.push(room);
        joinRoom(room);
    }

    const sortedMessages = computed(() =>
        messages.value.slice().sort((a, b) => a.ts - b.ts)
    );

    const roomMessages = computed(() =>
        sortedMessages.value.filter((msg) => {
            // Show all direct messages
            if (msg.type === "direct") return true;
            // Show messages in current room or no room specified
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

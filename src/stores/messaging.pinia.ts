import { defineStore } from "pinia";
import { computed, ref } from "vue";
import { useAuthStore } from "./auth.pinia";

export type MessagingEnvelope = {
    id?: string;
    type?: string;
    from?: string;
    to?: string;
    room?: string;
    payload?: any;
    text?: string;
    message?: string;
    meta?: any;
    ts?: number;
    timestamp?: number;
    users?: string[];
    history?: any[];
    you?: boolean;
};

export type ChatMessage = {
    id: string;
    type: string;
    from: string;
    to?: string;
    room?: string;
    text: string;
    payload?: any;
    ts: number;
    meta?: any;
};

const env = (import.meta as any)?.env || {};
const DEFAULT_MESSAGING_URL =
    (env.VITE_MESSAGING_URL as string) || "wss://waelio-messaging.onrender.com/";
const MAX_MESSAGES = 200;

function makeId(prefix = "msg") {
    return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(16).slice(2, 8)}`;
}

function normalizeMessage(msg: MessagingEnvelope): ChatMessage {
    const ts = Number(msg?.ts || msg?.timestamp || Date.now());
    const text =
        (typeof msg?.text === "string" && msg.text) ||
        (typeof msg?.payload === "string" && msg.payload) ||
        (typeof msg?.message === "string" && msg.message) ||
        (typeof msg?.payload === "object" && JSON.stringify(msg.payload)) ||
        "";

    return {
        id: msg?.id || makeId("msg"),
        type: msg?.type || "message",
        from: msg?.from || msg?.user || msg?.sender || "anon",
        to: msg?.to,
        room: msg?.room,
        text,
        payload: msg?.payload,
        ts,
        meta: msg?.meta,
    };
}

export const useMessagingStore = defineStore("messaging", () => {
    const authStore = useAuthStore();
    const ws = ref<WebSocket | null>(null);
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
            ws.value?.close();
        } catch { }
        ws.value = null;
        connected.value = false;
        connecting.value = false;
    }

    function connect(nextUrl?: string) {
        if (typeof window === "undefined") return;
        const target = (nextUrl || url.value || "").trim();
        if (!target) {
            error.value = "Messaging URL missing";
            return;
        }

        if (ws.value) disconnect();

        url.value = target;
        error.value = null;
        connecting.value = true;

        const socket = new WebSocket(target);
        ws.value = socket;

        socket.addEventListener("open", () => {
            connected.value = true;
            connecting.value = false;

            // Set local identity from auth store
            const username = authStore._user?.username || authStore.savedName;
            if (username) {
                me.value = username;
            }
        });

        socket.addEventListener("close", () => {
            connected.value = false;
            connecting.value = false;
        });

        socket.addEventListener("error", () => {
            error.value = "Connection error";
            connecting.value = false;
        });

        socket.addEventListener("message", (event) => {
            handleIncoming(event.data);
        });
    }

    function safeSend(payload: any) {
        if (!ws.value || ws.value.readyState !== WebSocket.OPEN) return false;
        try {
            ws.value.send(JSON.stringify(payload));
            return true;
        } catch (err) {
            console.warn("[messaging] send failed", err);
            return false;
        }
    }

    function handleIncoming(raw: any) {
        let parsed: MessagingEnvelope | null = null;
        try {
            parsed =
                typeof raw === "string"
                    ? JSON.parse(raw)
                    : JSON.parse(new TextDecoder().decode(raw));
        } catch {
            parsed = { type: "text", payload: raw as any };
        }
        if (!parsed) return;
        processEnvelope(parsed);
    }

    function processEnvelope(msg: MessagingEnvelope) {
        const type = msg?.type || "message";

        // Hub sends register-success { id } when client joins
        if (type === "register-success" && msg?.id) {
            me.value = msg.id;
            return;
        }

        if (msg?.you && msg?.id) {
            me.value = msg.id;
        }

        if (type === "userlist" && Array.isArray(msg.users)) {
            users.value = msg.users;
            return;
        }

        if (type === "history" && Array.isArray(msg.history)) {
            messages.value = msg.history.map((m: any) => normalizeMessage(m));
            return;
        }

        const normalized = normalizeMessage(msg);
        messages.value.push(normalized);
        if (messages.value.length > MAX_MESSAGES) {
            messages.value.splice(0, messages.value.length - MAX_MESSAGES);
        }
    }

    function sendBroadcast(text: string, room?: string) {
        const body = (text || "").trim();
        if (!body) return;
        const targetRoom = room || currentRoom.value;
        const sent = safeSend({ type: "broadcast", payload: body, room: targetRoom });
        if (!sent) return;
        messages.value.push({
            id: makeId("local"),
            type: "broadcast",
            from: me.value || "me",
            room: targetRoom,
            text: body,
            ts: Date.now(),
        });
    }

    function sendDirect(text: string, to: string) {
        const body = (text || "").trim();
        if (!body || !to) return;
        // Hub expects "route" for targeted messages
        const sent = safeSend({ type: "route", to, payload: body });
        if (!sent) return;
        messages.value.push({
            id: makeId("local"),
            type: "direct",
            from: me.value || "me",
            to,
            text: body,
            ts: Date.now(),
        });
    }

    function requestHistory() {
        safeSend({ type: "history" });
    }

    function requestUsers() {
        safeSend({ type: "userlist" });
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

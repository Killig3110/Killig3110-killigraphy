import { Server, Socket } from "socket.io";

interface SendMessageData {
    chatId: string;
    message: string;
}

interface SeenMessageData {
    chatId: string;
    userId: string;
    messageId: string;
}

interface CallData {
    targetId: string;
    offer?: any;
    answer?: any;
    from?: string;
    candidate?: any;
}

export const initSocket = (server: any) => {
    const io = new Server(server, {
        cors: {
            origin: "*",
            methods: ["GET", "POST"],
        },
    });

    io.on("connection", (socket: Socket) => {
        console.log("Socket connected:", socket.id);

        socket.on("join_chat", (chatId: string) => {
            socket.join(chatId);
        });

        socket.on("leave_chat", (chatId: string) => {
            socket.leave(chatId);
        });

        socket.on("send_message", (messageData: SendMessageData) => {
            const { chatId, message } = messageData;
            io.to(chatId).emit("new_message", message);
        });

        socket.on("seen_message", ({ chatId, userId, messageId }: SeenMessageData) => {
            io.to(chatId).emit("message_seen", { chatId, userId, messageId });
        });

        socket.on("typing", ({ chatId, userId }: { chatId: string; userId: string }) => {
            socket.to(chatId).emit("user_typing", { userId });
        });

        socket.on("stop_typing", ({ chatId, userId }: { chatId: string; userId: string }) => {
            socket.to(chatId).emit("user_stop_typing", { userId });
        });

        socket.on("call_user", ({ targetId, offer, from }: CallData) => {
            io.to(targetId).emit("incoming_call", { from, offer });
        });

        socket.on("answer_call", ({ targetId, answer }: CallData) => {
            io.to(targetId).emit("call_answered", { answer });
        });

        socket.on("ice_candidate", ({ targetId, candidate }: CallData) => {
            io.to(targetId).emit("ice_candidate", { candidate });
        });

        socket.on("end_call", ({ targetId }: CallData) => {
            io.to(targetId).emit("call_ended");
        });

        socket.on("disconnect", () => {
            console.log("Socket disconnected:", socket.id);
        });
    });

    return io;
};

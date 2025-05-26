// src/hooks/useChatSocket.ts
import { useEffect } from "react";
import socket from "@/lib/socket";
import { useUserContext } from "@/context/AuthContext";

type Props = {
    chatId: string;
    onMessage?: (msg: any) => void;
    onSeen?: (data: any) => void;
    onTyping?: (userId: string) => void;
    onStopTyping?: (userId: string) => void;
};

export const useChatSocket = ({
    chatId,
    onMessage,
    onSeen,
    onTyping,
    onStopTyping,
}: Props) => {
    const { user } = useUserContext();

    useEffect(() => {
        if (!chatId || !user._id) return;

        socket.emit("join_chat", chatId);

        socket.on("new_message", (msg: any) => {
            if (onMessage) onMessage(msg);
        });

        socket.on("message_seen", (data: any) => {
            if (onSeen) onSeen(data);
        });

        socket.on("user_typing", ({ userId }: { userId: string }) => {
            if (onTyping) onTyping(userId);
        });

        socket.on("user_stop_typing", ({ userId }: { userId: string }) => {
            if (onStopTyping) onStopTyping(userId);
        });

        return () => {
            socket.emit("leave_chat", chatId);
            socket.off("new_message");
            socket.off("message_seen");
            socket.off("user_typing");
            socket.off("user_stop_typing");
        };
    }, [chatId, user._id]);
};

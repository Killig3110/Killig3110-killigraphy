// src/components/chat/ChatBottomSheet.tsx
import {
    Dialog,
    DialogContent,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { X, Phone, ImageIcon, Mic } from "lucide-react";
import { useEffect, useState } from "react";
import { MessageType, User } from "@/lib/api";
import { useSendMessageMutation } from "@/lib/react-query/QueriesAndMutations";
import socket from "@/lib/socket";

const ChatBottomSheet = ({ user, onClose }: { user: User & { chatId: string }; onClose: () => void }) => {
    const [open, setOpen] = useState(false);
    const [message, setMessage] = useState("");
    const [messages, setMessages] = useState<any[]>([]);
    const { mutate: sendMessage } = useSendMessageMutation();

    useEffect(() => {
        const handleNewMessage = (msg: any) => {
            if (msg.chat === user.chatId) {
                setMessages((prev) => [...prev, msg]);
            }
        };

        socket.on("new_message", handleNewMessage);
        return () => {
            socket.off("new_message", handleNewMessage);
        };
    }, [user.chatId]);

    const handleSendMessage = () => {
        if (!message.trim()) return;

        sendMessage(
            {
                chatId: user.chatId,
                content: message,
                type: MessageType.TEXT,
            },
            {
                onSuccess: (newMessage) => {
                    socket.emit("send_message", {
                        chatId: user.chatId,
                        message: newMessage,
                    });
                    setMessages((prev) => [...prev, newMessage]);
                    setMessage("");
                },
            }
        );
    };

    return (
        <Dialog open={open} onOpenChange={(val) => {
            setOpen(val);
            if (!val) onClose();
        }}>
            <DialogTrigger asChild>
                <Button size="sm" className="text-xs" onClick={() => setOpen(true)}>
                    Chat
                </Button>
            </DialogTrigger>

            <DialogContent className="sm:max-w-full bottom-0 fixed inset-x-0 !mt-0 !translate-y-0 !h-[80vh] rounded-t-2xl p-0">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b">
                    <div className="flex items-center gap-3">
                        <img
                            src={user.imageUrl}
                            alt={user.name}
                            className="w-10 h-10 rounded-full object-cover"
                        />
                        <div>
                            <p className="text-sm font-semibold">{user.name}</p>
                            <p className="text-xs text-muted-foreground">@{user.username}</p>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <Button size="icon" variant="ghost">
                            <Phone className="w-5 h-5" />
                        </Button>
                        <Button size="icon" variant="ghost" onClick={() => setOpen(false)}>
                            <X className="w-5 h-5" />
                        </Button>
                    </div>
                </div>

                {/* Chat messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-2 text-sm">
                    {messages.map((msg, i) => (
                        <div
                            key={i}
                            className={`max-w-[75%] px-3 py-2 rounded-lg ${msg.sender === user._id
                                ? "bg-muted text-black"
                                : "bg-primary text-white ml-auto"
                                }`}
                        >
                            {msg.content}
                        </div>
                    ))}
                </div>

                {/* Input section */}
                <div className="border-t p-4 flex items-center gap-2">
                    <Input
                        placeholder="Aa..."
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        className="flex-1"
                        onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                    />
                    <Button size="icon" variant="ghost">
                        <Mic className="w-5 h-5" />
                    </Button>
                    <Button size="icon" variant="ghost">
                        <ImageIcon className="w-5 h-5" />
                    </Button>
                    <Button onClick={handleSendMessage}>Send</Button>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default ChatBottomSheet;

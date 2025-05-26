// src/components/chat/VoiceCallDialog.tsx
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { Phone, X } from "lucide-react";
import socket from "@/lib/socket";
import { User } from "@/lib/api";
import { useVoiceCall } from "@/hooks/useVoiceCall";

type Props = {
    currentUser: User;
};

const VoiceCallDialog = ({ }: Props) => {
    const [incomingCall, setIncomingCall] = useState<{
        from: User;
        offer: RTCSessionDescriptionInit;
    } | null>(null);
    const [inCall, setInCall] = useState(false);

    const {
        answerCall,
        handleAnswer,
        handleRemoteCandidate,
        endCall,
        localStream,
    } = useVoiceCall();

    // === Lắng nghe sự kiện gọi đến ===
    useEffect(() => {
        socket.on("incoming_call", ({ from, offer }: { from: User; offer: RTCSessionDescriptionInit }) => {
            setIncomingCall({ from, offer });
        });

        socket.on("call_answered", ({ answer }: { answer: RTCSessionDescriptionInit }) => {
            handleAnswer(answer);
        });

        socket.on("ice_candidate", ({ candidate }: { candidate: RTCIceCandidateInit }) => {
            handleRemoteCandidate(candidate);
        });

        socket.on("call_ended", () => {
            setIncomingCall(null);
            setInCall(false);
            // Stop media stream nếu cần
            localStream.current?.getTracks().forEach((track) => track.stop());
        });

        return () => {
            socket.off("incoming_call");
            socket.off("call_answered");
            socket.off("ice_candidate");
            socket.off("call_ended");
        };
    }, []);

    const handleAccept = async () => {
        if (!incomingCall) return;
        await answerCall(incomingCall.from._id, incomingCall.offer);
        setInCall(true);
    };

    const handleReject = () => {
        socket.emit("end_call", { targetId: incomingCall?.from._id });
        setIncomingCall(null);
    };

    return (
        <Dialog open={!!incomingCall}>
            <DialogContent className="w-[90%] max-w-md text-center space-y-4">
                {inCall ? (
                    <>
                        <h3 className="text-xl font-bold">Đang gọi với {incomingCall?.from.name}</h3>
                        <Button
                            variant="destructive"
                            onClick={() => {
                                endCall(incomingCall!.from._id);
                                setInCall(false);
                                setIncomingCall(null);
                            }}
                            className="w-full"
                        >
                            Kết thúc cuộc gọi
                        </Button>
                    </>
                ) : (
                    <>
                        <img
                            src={incomingCall?.from.imageUrl}
                            alt="caller"
                            className="w-16 h-16 rounded-full mx-auto object-cover"
                        />
                        <h3 className="text-lg font-medium">{incomingCall?.from.name}</h3>
                        <p className="text-muted-foreground text-sm">Cuộc gọi đến...</p>

                        <div className="flex justify-center gap-4 pt-2">
                            <Button
                                variant="secondary"
                                onClick={handleReject}
                                className="flex items-center gap-1"
                            >
                                <X className="w-4 h-4" />
                                Từ chối
                            </Button>
                            <Button
                                onClick={handleAccept}
                                className="flex items-center gap-1"
                            >
                                <Phone className="w-4 h-4" />
                                Trả lời
                            </Button>
                        </div>
                    </>
                )}
            </DialogContent>
        </Dialog>
    );
};

export default VoiceCallDialog;

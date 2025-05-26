// hooks/useVoiceCall.ts
import { useRef } from "react";
import socket from "@/lib/socket";

export const useVoiceCall = () => {
    const peerConnection = useRef<RTCPeerConnection | null>(null);
    const localStream = useRef<MediaStream | null>(null);

    const setupMedia = async () => {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        localStream.current = stream;
        return stream;
    };

    const startCall = async (targetId: string, currentUserId: string) => {
        await setupMedia();
        peerConnection.current = new RTCPeerConnection();

        localStream.current?.getTracks().forEach(track => {
            peerConnection.current?.addTrack(track, localStream.current!);
        });

        peerConnection.current.onicecandidate = (e) => {
            if (e.candidate) {
                socket.emit("ice_candidate", {
                    targetId,
                    candidate: e.candidate,
                });
            }
        };

        const offer = await peerConnection.current.createOffer();
        await peerConnection.current.setLocalDescription(offer);

        socket.emit("call_user", {
            targetId,
            from: currentUserId,
            offer,
        });
    };

    const answerCall = async (from: string, offer: RTCSessionDescriptionInit) => {
        await setupMedia();
        peerConnection.current = new RTCPeerConnection();

        localStream.current?.getTracks().forEach(track => {
            peerConnection.current?.addTrack(track, localStream.current!);
        });

        peerConnection.current.onicecandidate = (e) => {
            if (e.candidate) {
                socket.emit("ice_candidate", {
                    targetId: from,
                    candidate: e.candidate,
                });
            }
        };

        await peerConnection.current.setRemoteDescription(offer);
        const answer = await peerConnection.current.createAnswer();
        await peerConnection.current.setLocalDescription(answer);

        socket.emit("answer_call", {
            targetId: from,
            answer,
        });
    };

    const handleAnswer = (answer: RTCSessionDescriptionInit) => {
        peerConnection.current?.setRemoteDescription(answer);
    };

    const handleRemoteCandidate = (candidate: RTCIceCandidateInit) => {
        peerConnection.current?.addIceCandidate(new RTCIceCandidate(candidate));
    };

    const endCall = (targetId: string) => {
        peerConnection.current?.close();
        socket.emit("end_call", { targetId });
    };

    return {
        startCall,
        answerCall,
        handleAnswer,
        handleRemoteCandidate,
        endCall,
        localStream,
    };
};

import { Button } from '@/components/ui/button';
import { useFollowersQueryMutation, useGetPrivateChatMutation } from '@/lib/react-query/QueriesAndMutations';
import { useUserContext } from '@/context/AuthContext';
import Loader from './Loader';
import { User } from '@/lib/api';
import ChatBottomSheet from './ChatBottomSheet';
import { useState } from 'react';

const FollowingSidebar = () => {
    const { user } = useUserContext();
    const { data, isPending: isLoading } = useFollowersQueryMutation(user._id);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [chatId, setChatId] = useState<string | null>(null);
    const { mutate: getChat } = useGetPrivateChatMutation();

    const handleOpenChat = (targetUser: User) => {
        getChat(
            targetUser._id,
            {
                onSuccess: (data) => {
                    const chat = data as { _id: string };
                    setSelectedUser(targetUser);
                    setChatId(chat._id);
                },
            }
        );
    };

    const followers = Array.isArray(data) ? data : [];

    return (
        <div className="space-y-4">
            <h3 className="text-lg font-semibold">Following</h3>

            {isLoading && (
                <div className="flex-center">
                    <Loader />
                </div>
            )}

            {followers.length === 0 ? (
                <p className="text-sm text-muted-foreground">You are not following anyone yet.</p>
            ) : (
                followers.map((user) => (
                    <div key={user._id} className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                            <img
                                src={user.imageUrl}
                                alt={user.name}
                                className="w-10 h-10 rounded-full object-cover"
                            />
                            <div>
                                <p className="text-sm font-medium">{user.name}</p>
                                <p className="text-xs text-muted-foreground">@{user.username}</p>
                            </div>
                        </div>
                        <Button onClick={() => handleOpenChat(user)}>Chat</Button>
                    </div>
                ))
            )}

            {selectedUser && chatId && (
                <ChatBottomSheet
                    user={{ ...selectedUser, chatId }}
                    onClose={() => {
                        setSelectedUser(null);
                        setChatId(null);
                    }}
                />
            )}
        </div>
    );
};

export default FollowingSidebar;

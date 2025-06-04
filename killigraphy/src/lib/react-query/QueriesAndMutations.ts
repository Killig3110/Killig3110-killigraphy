import {
    useQuery,
    useMutation,
    useQueryClient,
    useInfiniteQuery,
} from '@tanstack/react-query';

import {
    loginUser,
    logoutUser,
    registerUser,
    getCurrentUser,
    createPost,
    getRecentPosts,
    toggleLikePost,
    savePost,
    unsavePost,
    getSavedPosts,
    requestOtp,
    verifyOtp,
    createComment,
    getCommentsByPost,
    deleteComment,
    getPostById,
    deletePost,
    updatePost,
    getUserPosts,
    fetchPaginatedPosts,
    PaginatedPostResponse,
    PostSearchParams,
    searchPosts,
    fetchPostMeta,
    toggleFollowUser,
    checkIsFollowing,
    getFollowers,
    getFollowing,
    getPaginatedUsers,
    User,
    getUserById,
    getListPosts,
    UpdateProfilePayload,
    updateUser,
    UpdatePasswordPayload,
    updatePassword,
    sendMessage,
    getMessagesByChatId,
    getUserChats,
    getChatByUserId,
    getPrivateChat,
    suggestedPaginatedUsers,
    getFeedPersonalized,
    PostMeta,
} from '../api';

import { LoginPayload, RegisterPayload, PostPayload } from '../api';
import { QUERY_KEYS } from './QueryKeys';

// =========================
// AUTH
// =========================
export const useCreateUserAccountMutation = () =>
    useMutation({
        mutationFn: (user: RegisterPayload) => registerUser(user),
    });

export const useSignInAccountMutation = () =>
    useMutation({
        mutationFn: (user: LoginPayload) => loginUser(user),
    });

export const useSignOutAccountMutation = () =>
    useMutation({
        mutationFn: logoutUser,
    });

export const useRequestOtpMutation = () => {
    return useMutation({
        mutationFn: ({ email }: { email: string }) => requestOtp({ email }),
    });
};

export const useVerifyOtpMutation = () => {
    return useMutation({
        mutationFn: ({ email, otp }: { email: string; otp: string }) => verifyOtp({ email, otp }),
    });
};

// =========================
// CURRENT USER
// =========================
export const useGetCurrentUserMutation = () =>
    useQuery({
        queryKey: [QUERY_KEYS.GET_CURRENT_USER],
        queryFn: getCurrentUser,
    });

export const useInfiniteUsersMutation = () => {
    return useInfiniteQuery<User[]>({
        queryKey: [QUERY_KEYS.GET_USERS],
        initialPageParam: 1,
        queryFn: async ({ pageParam = 1 }) => {
            return await getPaginatedUsers(pageParam as number);
        },
        getNextPageParam: (lastPage, allPages) => {
            return lastPage.length < 10 ? undefined : allPages.length + 1;
        },
    });
};

export const useGetUserByIdMutation = (userId: string) =>
    useQuery({
        queryKey: [QUERY_KEYS.GET_USER_BY_ID, userId],
        queryFn: () => getUserById(userId),
        enabled: !!userId,
    });

export const useUpdateUserMutation = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ userId, ...rest }: UpdateProfilePayload) =>
            updateUser(userId, rest as UpdateProfilePayload),
        onSuccess: (data) => {
            // InvalidateQueries is used to refetch the user data after update
            queryClient.invalidateQueries({
                queryKey: [QUERY_KEYS.GET_USER_BY_ID, data._id],
            });
        },
    });
};

export const useChangePasswordMutation = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ userId, ...rest }: UpdatePasswordPayload) => {
            return updatePassword(userId, rest as UpdatePasswordPayload);
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries({
                queryKey: [QUERY_KEYS.GET_USER_BY_ID, data._id],
            });
        },
    });
}

// =========================
// POST
// =========================
export const useCreatePostMutation = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (post: PostPayload) => createPost(post),
        onSuccess: (data) => {
            queryClient.invalidateQueries({
                queryKey: [QUERY_KEYS.GET_RECENT_POSTS, data?._id],
            });
        },
    });
};

export const useUpdatePostMutation = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ postId, post }: { postId: string; post: PostPayload }) => updatePost(postId, post),
        onSuccess: (data) => {
            queryClient.invalidateQueries({
                queryKey: [QUERY_KEYS.GET_RECENT_POSTS, data?._id],
            });
        },
    });
};

export const useDeletePostMutation = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (postId: string) => deletePost(postId),
        onSuccess: (data) => {
            queryClient.invalidateQueries({
                queryKey: [QUERY_KEYS.GET_RECENT_POSTS, data?._id],
            });
        },
    });
};

export const useGetRecentPostsMutation = () =>
    useQuery({
        queryKey: [QUERY_KEYS.GET_RECENT_POSTS],
        queryFn: getRecentPosts,
    });

export const useGetFeedPersonalizedMutation = () =>
    useInfiniteQuery({
        queryKey: [QUERY_KEYS.GET_PERSONALIZED_FEED],
        queryFn: ({ pageParam = 1 }) => getFeedPersonalized(pageParam, 12),
        initialPageParam: 1,
        getNextPageParam: (lastPage, allPages) =>
            lastPage.length < 12 ? undefined : allPages.length + 1,
    });

export const useToggleLikePostMutation = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (postId: string) => toggleLikePost(postId),
        onSuccess: (data) => {
            queryClient.invalidateQueries({
                queryKey: [QUERY_KEYS.GET_RECENT_POSTS, data?._id],
            });
        },
    });
};

export const useGetPostByIdMutation = (postId: string) =>
    useQuery({
        queryKey: [QUERY_KEYS.GET_POST_BY_ID, postId],
        queryFn: () => getPostById(postId),
        enabled: !!postId,
    });

export const useGetUserPostsMutation = (userId: string) =>
    useQuery({
        queryKey: [QUERY_KEYS.GET_USER_POSTS, userId],
        queryFn: () => getUserPosts(userId),
        enabled: !!userId,
    });

export const useGetListPostsMutation = (listPosts: string[]) =>
    useQuery({
        queryKey: [QUERY_KEYS.GET_POST_LIST, listPosts],
        queryFn: () => getListPosts(listPosts),
        enabled: Array.isArray(listPosts) && listPosts.length > 0, // An toàn hơn
    });

// =========================
// SAVED POSTS
// =========================
export const useSavePostMutation = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (postId: string) => savePost(postId),
        onSuccess: (data) => {
            queryClient.invalidateQueries({
                queryKey: [QUERY_KEYS.GET_RECENT_POSTS, data?._id],
            });
            queryClient.invalidateQueries({
                queryKey: [QUERY_KEYS.GET_SAVED_POSTS, data?._id],
            });
        },
    });
};

export const useUnsavePostMutation = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (postId: string) => unsavePost(postId),
        onSuccess: (data) => {
            queryClient.invalidateQueries({
                queryKey: [QUERY_KEYS.GET_RECENT_POSTS, data?._id],
            });
            queryClient.invalidateQueries({
                queryKey: [QUERY_KEYS.GET_SAVED_POSTS, data?._id],
            });
        },
    });
};

export const useGetSavedPostsMutation = () =>
    useQuery({
        queryKey: [QUERY_KEYS.GET_SAVED_POSTS],
        queryFn: () => getSavedPosts(),
    });

export const useInfinitePostsMutation = () => {
    return useInfiniteQuery<PaginatedPostResponse, Error>({
        queryKey: [QUERY_KEYS.GET_POSTS],
        queryFn: async ({ pageParam = 1 }) => {
            return await fetchPaginatedPosts(pageParam as number);
        },
        initialPageParam: 1,
        getNextPageParam: (lastPage, allPages) => {
            return lastPage.hasMore ? allPages.length + 1 : undefined;
        },
    });
};

export const useSearchPostsMutation = (params: PostSearchParams) =>
    useQuery({
        queryKey: [QUERY_KEYS.SEARCH_POSTS, params],
        queryFn: () => searchPosts(params),
        enabled: !!params.query || !!params.tags?.length || !!params.location,
    });

export const usePostMetaMutation = () =>
    useInfiniteQuery({
        queryKey: [QUERY_KEYS.GET_POST_META],
        queryFn: ({ pageParam = 1 }) => fetchPostMeta(pageParam) as Promise<PostMeta>,
        initialPageParam: 1,
        getNextPageParam: (lastPage, allPages) =>
            lastPage.hasMore ? allPages.length + 1 : undefined,
        staleTime: 1000 * 60 * 5, // 5 minutes
    });

// useFollowMutation
export const useToggleFollowMutation = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (userId: string) => toggleFollowUser(userId),
        onSuccess: (_, userId) => {
            // Invalidate cache để cập nhật UI
            queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.GET_USER_IS_FOLLOWING, userId] });
            queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.GET_USER_FOLLOWERS, userId] });
            queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.GET_CURRENT_USER] });
            queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.GET_USER_BY_ID, userId] });
        },
    });
};

export const useIsFollowingQueryMutation = (userId: string, enabled = true) =>
    useQuery({
        queryKey: [QUERY_KEYS.GET_USER_IS_FOLLOWING, userId],
        queryFn: () => checkIsFollowing(userId),
        enabled,
    });

export const useFollowersQueryMutation = (userId: string) =>
    useQuery({
        queryKey: [QUERY_KEYS.GET_USER_FOLLOWERS, userId],
        queryFn: () => getFollowers(userId),
    });

export const useFollowingQuery = (userId: string) =>
    useQuery({
        queryKey: [QUERY_KEYS.GET_USER_FOLLOWING, userId],
        queryFn: () => getFollowing(userId),
    });

export const useSuggestedUsersQuery = (userId: string) =>
    useQuery({
        queryKey: [QUERY_KEYS.GET_SUGGESTED_USERS, userId],
        queryFn: () => suggestedPaginatedUsers(1, 10, userId),
        enabled: !!userId,
    });

export const useSuggestedUsersInfiniteQuery = (userId: string) => {
    return useInfiniteQuery({
        queryKey: [QUERY_KEYS.GET_SUGGESTED_USERS, userId],
        queryFn: ({ pageParam = 1 }) => suggestedPaginatedUsers(pageParam, 10, userId),
        initialPageParam: 1,
        getNextPageParam: (lastPage, allPages) =>
            lastPage.length < 10 ? undefined : allPages.length + 1,
        enabled: !!userId,
    });
};

// =========================
// COMMENTS
// =========================

export const useCreateCommentMutation = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({
            content,
            postId,
            parentId,
        }: {
            content: string;
            postId: string;
            parentId?: string;
        }) => createComment({ content, postId, parentId }),

        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({
                queryKey: [QUERY_KEYS.GET_COMMENTS_BY_POST, variables.postId],
            });
        },
    });
};

export const useDeleteCommentMutation = (postId: string) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (commentId: string) => deleteComment(commentId),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: [QUERY_KEYS.GET_COMMENTS_BY_POST, postId],
            });
        },
    });
};

export const useGetCommentsByPostMutation = (postId: string) =>
    useQuery({
        queryKey: [QUERY_KEYS.GET_COMMENTS_BY_POST, postId],
        queryFn: () => getCommentsByPost(postId),
    });

// =========================
// SOCKET
// =========================

export const useSendMessageMutation = () => {
    return useMutation({
        mutationFn: sendMessage,
    });
};

export const useMessagesQuery = (chatId: string) => {
    return useQuery({
        queryKey: ["messages", chatId],
        queryFn: () => getMessagesByChatId(chatId),
        enabled: !!chatId,
    });
};

export const useUserChatsQuery = () => {
    return useQuery({
        queryKey: ["user-chats"],
        queryFn: getUserChats,
    });
};

export const useGetChatByUserIdMutation = (userId: string) => {
    return useQuery({
        queryKey: [QUERY_KEYS.GET_CHAT_BY_USER_ID, userId],
        queryFn: () => getChatByUserId(userId),
        enabled: !!userId,
    });
}

export const useGetPrivateChatMutation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (userId: string) => getPrivateChat(userId),
        onSuccess: (data) => {
            queryClient.invalidateQueries({
                queryKey: [QUERY_KEYS.GET_PRIVATE_CHAT_BY_USER_ID, data],
            });
        },
    });
};
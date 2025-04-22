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
    Post,
    PostSearchParams,
    searchPosts,
    fetchPostMeta,
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
    return useInfiniteQuery<Post[], Error>({
        queryKey: [QUERY_KEYS.GET_POSTS],
        queryFn: async ({ pageParam = 1 }) => {
            return await fetchPaginatedPosts(pageParam as number);
        },
        initialPageParam: 1,
        getNextPageParam: (lastPage, allPages) => {
            return lastPage.length < 10 ? undefined : allPages.length + 1;
        },
    });
};

export const useSearchPostsMutation = (params: PostSearchParams) =>
    useQuery({
        queryKey: [QUERY_KEYS.SEARCH_POSTS, params],
        queryFn: () => searchPosts(params),
        enabled: !!params.query || !!params.tags?.length,
    });

export const usePostMetaMutation = () =>
    useQuery({
        queryKey: [QUERY_KEYS.GET_POST_META],
        queryFn: fetchPostMeta,
        staleTime: 1000 * 60 * 5, // 5 minutes
    });

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
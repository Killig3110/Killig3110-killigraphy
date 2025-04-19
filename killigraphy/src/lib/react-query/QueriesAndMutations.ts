import {
    useQuery,
    useMutation,
    useQueryClient,
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
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: [QUERY_KEYS.GET_RECENT_POSTS],
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
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: [QUERY_KEYS.GET_RECENT_POSTS],
            });
        },
    });
};

// =========================
// SAVED POSTS
// =========================
export const useSavePostMutation = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (postId: string) => savePost(postId),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: [QUERY_KEYS.GET_RECENT_POSTS],
            });
            queryClient.invalidateQueries({
                queryKey: [QUERY_KEYS.GET_SAVED_POSTS],
            });
        },
    });
};

export const useUnsavePostMutation = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (postId: string) => unsavePost(postId),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: [QUERY_KEYS.GET_RECENT_POSTS],
            });
            queryClient.invalidateQueries({
                queryKey: [QUERY_KEYS.GET_SAVED_POSTS],
            });
        },
    });
};

export const useGetSavedPostsMutation = () =>
    useQuery({
        queryKey: [QUERY_KEYS.GET_SAVED_POSTS],
        queryFn: getSavedPosts,
    });

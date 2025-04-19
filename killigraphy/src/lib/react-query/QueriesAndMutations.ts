// This file contains the queries and mutations for the app
// It uses react-query for data fetching and state management
// It also uses appwrite for backend services
// Custom hooks are created for each query and mutation

import {
    useQuery, // for fetching data to display in the UI 
    useMutation, // for creating/updating/deleting data
    useQueryClient, // for invalidating queries
    useInfiniteQuery, // for paginated data fetching

} from '@tanstack/react-query'
import { create } from 'domain'
import { createPost, createUserAccount, deleteSavedPost, getCurrentUser, getRecentPosts, likePost, savePost, signInAccount, signOutAccount } from '../Appwrite/api'
import { INewPost, INewUser } from '@/types'
import { QUERY_KEYS } from './QueryKeys'

export const useCreateUserAccountMutation = () => {
    return useMutation({
        mutationFn: (user: INewUser) => createUserAccount(user), // this function creates a new user account for the user and returns the account details
    })
}

export const useSignInAccountMutation = () => {
    return useMutation({
        mutationFn: (user: {
            email: string,
            password: string,
        }) => signInAccount(user),
    })
}

export const useSignOutAccountMutation = () => {
    return useMutation({
        mutationFn: signOutAccount, // this function signs out the user from the appwrite account
    })
}

export const useCreatePostMutation = () => {
    const queryClient = useQueryClient() // this is used to invalidate queries after creating a new post
    return useMutation({
        mutationFn: (post: INewPost) => createPost(post),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: [QUERY_KEYS.GET_RECENT_POSTS], // this is the query key for the recent posts query
            })
        }

    })
}

export const useGetRecentPostsMutation = () => {
    return useQuery({
        queryKey: [QUERY_KEYS.GET_RECENT_POSTS], // this is the query key for the recent posts query
        queryFn: getRecentPosts
    })
} // this function fetches the recent posts from the appwrite database and returns them as an array of documents

export const useLikePost = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({
            postId,
            likesArray,
        }: {
            postId: string;
            likesArray: string[];
        }) => likePost(postId, likesArray),
        onSuccess: (data) => {
            queryClient.invalidateQueries({
                queryKey: [QUERY_KEYS.GET_POST_BY_ID, data?.$id],
            });
            queryClient.invalidateQueries({
                queryKey: [QUERY_KEYS.GET_RECENT_POSTS],
            });
            queryClient.invalidateQueries({
                queryKey: [QUERY_KEYS.GET_POSTS],
            });
            queryClient.invalidateQueries({
                queryKey: [QUERY_KEYS.GET_CURRENT_USER],
            });
        },
    });
};

export const useSavePost = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ userId, postId }: { userId: string; postId: string }) =>
            savePost(userId, postId),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: [QUERY_KEYS.GET_RECENT_POSTS],
            });
            queryClient.invalidateQueries({
                queryKey: [QUERY_KEYS.GET_POSTS],
            });
            queryClient.invalidateQueries({
                queryKey: [QUERY_KEYS.GET_CURRENT_USER],
            });
        },
    });
};

export const useDeleteSavedPost = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (savedRecordId: string) => deleteSavedPost(savedRecordId),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: [QUERY_KEYS.GET_RECENT_POSTS],
            });
            queryClient.invalidateQueries({
                queryKey: [QUERY_KEYS.GET_POSTS],
            });
            queryClient.invalidateQueries({
                queryKey: [QUERY_KEYS.GET_CURRENT_USER],
            });
        },
    });
};

export const useGetCurrentUser = () => {
    return useQuery({
        queryKey: [QUERY_KEYS.GET_CURRENT_USER],
        queryFn: getCurrentUser,
    });
};

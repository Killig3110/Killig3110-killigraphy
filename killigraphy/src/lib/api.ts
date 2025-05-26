import { PopulatedComment } from '@/types/shared';
import axios from 'axios';

const API = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
    withCredentials: true,
});

export default API;

// =========================
// ========== TYPES =========================
// =========================

export interface LoginPayload {
    email: string;
    password: string;
}

export interface RegisterPayload {
    name: string;
    username: string;
    email: string;
    password: string;
}

export interface UpdateProfilePayload {
    userId: string;
    name: string;
    username?: string;
    bio?: string;
    file?: File;
    imageUrl?: string;
}

export interface UpdatePasswordPayload {
    userId: string;
    oldPassword: string;
    newPassword: string;
}

export interface User {
    _id: string;
    name: string;
    username: string;
    email: string;
    accountId: string;
    bio: string;
    imageUrl: string;
    createdAt?: string;
    updatedAt?: string;
    likedPosts?: string[]; // or Post[]

    followers?: string[]; // or User[]
    following?: string[]; // or User[]
}

export interface PostPayload {
    caption: string;
    location?: string;
    tags?: string;
    image?: File;
}

export interface Post {
    _id: string;
    creator: User;
    caption: string;
    location?: string;
    tags: string[];
    imageId: string;
    imageURL: string;
    likes: string[];
    createdAt: string;
    updatedAt: string;
}

export interface CommentType {
    _id: string;
    content: string;
    user: {
        _id: string;
        name: string;
        imageUrl: string;
    };
    post: string;
    parent?: string;
    createdAt: string;
}

export interface PostSearchParams {
    query?: string;
    tags?: string[];
    location?: string;
    sort?: "latest" | "popular";
}

export interface PostMeta {
    tags: string[];
    locations: string[];
}

export enum MessageType {
    TEXT = "text",
    IMAGE = "image",
    VOICE = "voice",
}

export enum MessageStatus {
    SEEN = "seen",
    UNSEEN = "unseen",
    DISCARDED = "discard",
}

// =========================
// ========== AUTH API =========================
// =========================

export const loginUser = async ({ email, password }: LoginPayload): Promise<User> => {
    const res = await API.post<User>('/auth/login', { email, password });
    return res.data;
};

export const registerUser = async (userData: RegisterPayload) => {
    await API.post('/auth/register', userData);
    return await loginUser({ email: userData.email, password: userData.password });
};

export const updateUser = async (
    userId: string,
    data: UpdateProfilePayload
): Promise<User> => {
    const formData = new FormData();
    formData.append("name", data.name);
    if (data.username) formData.append("username", data.username);
    if (data.bio) formData.append("bio", data.bio);
    if (data.file) {
        formData.append("image", data.file);
    }

    const res = await API.patch<User>(`/users/${userId}`, formData);
    return res.data;
};

export const updatePassword = async (userId: string, data: UpdatePasswordPayload): Promise<User> => {
    const res = await API.patch<User>(`/users/${userId}/password`, data);
    return res.data;
};

export const getCurrentUser = async (): Promise<User> => {
    const res = await API.get<User>('/auth/me', { withCredentials: true });
    return res.data;
};

export const logoutUser = async () => {
    const res = await API.post('/auth/logout');
    return res.data;
};

// =========================
// ========== USER API =========================
// =========================

export const getPaginatedUsers = async (page: number, limit = 10): Promise<User[]> => {
    const res = await API.get<User[]>(`/users?page=${page}&limit=${limit}`);
    return res.data;
};

export const toggleFollowUser = async (userId: string): Promise<{ message: string; isFollowing: boolean }> => {
    const res = await API.patch<{ message: string; isFollowing: boolean }>(`/users/${userId}/follow`);
    return res.data;
};

export const getFollowers = async (userId: string): Promise<User[]> => {
    const res = await API.get<User[]>(`/users/${userId}/followers`);
    return res.data;
};

export const getFollowing = async (userId: string): Promise<User[]> => {
    const res = await API.get<User[]>(`/users/${userId}/following`);
    return res.data;
};

export const checkIsFollowing = async (userId: string): Promise<{ isFollowing: boolean }> => {
    const res = await API.get<{ isFollowing: boolean }>(`/users/${userId}/is-following`);
    return res.data;
};

export const getUserById = async (userId: string): Promise<User> => {
    const res = await API.get<User>(`/users/${userId}`);
    return res.data;
};

// ===========================
// ========== OTP API ===========================
// ===========================

export const requestOtp = async ({ email }: { email: string }) => {
    const res = await API.post("/auth/request-otp", { email });
    return res.data;
};

export const verifyOtp = async ({ email, otp }: { email: string; otp: string }) => {
    const res = await API.post("/auth/verify-otp", { email, otp });
    return res.data;
};

// ===========================
// ========== POST API ===========================
// ===========================

export const createPost = async (data: PostPayload): Promise<Post> => {
    const formData = new FormData();
    formData.append("caption", data.caption);
    if (data.location) formData.append("location", data.location);
    if (data.tags) formData.append("tags", data.tags);
    formData.append("image", data.image as File);

    const res = await API.post<Post>("/posts", formData);
    return res.data;
};

export const updatePost = async (postId: string, data: PostPayload): Promise<Post> => {
    const formData = new FormData();
    formData.append("caption", data.caption);
    if (data.location) formData.append("location", data.location);
    if (data.tags) formData.append("tags", data.tags);
    if (data.image) formData.append("image", data.image);

    const res = await API.patch<Post>(`/posts/${postId}`, formData);
    return res.data;
}

export const deletePost = async (postId: string): Promise<any> => {
    const res = await API.delete(`/posts/${postId}`);
    return res.data;
};

export const getRecentPosts = async (): Promise<Post[]> => {
    const res = await API.get<Post[]>("/posts");
    return res.data;
};

export const searchPosts = async (params: PostSearchParams): Promise<Post[]> => {
    const queryParams = new URLSearchParams();

    if (params.query) queryParams.append("query", params.query);
    if (params.tags && params.tags.length > 0)
        queryParams.append("tags", params.tags.join(","));
    if (params.location) queryParams.append("location", params.location);
    if (params.sort) queryParams.append("sort", params.sort);

    const res = await API.get<Post[]>(`/posts/search?${queryParams.toString()}`);
    return res.data;
};

export const fetchPostMeta = async (): Promise<PostMeta> => {
    const res = await API.get<PostMeta>("/posts/meta/trend");
    return res.data; // { tags: [...], locations: [...] }
};

export const getPostById = async (postId: string): Promise<Post> => {
    const res = await API.get(`/posts/${postId}`);
    return res.data as Post;
};

export const getUserPosts = async (userId: string): Promise<Post[]> => {
    const res = await API.get<Post[]>(`/posts/user/${userId}`);
    return res.data;
};

export const getListPosts = async (postIds: string[]): Promise<Post[]> => {
    const res = await API.post<Post[]>("/posts/list", { postIds });
    return res.data;
}

export const fetchPaginatedPosts = async (page = 1): Promise<Post[]> => {
    const res = await API.get<Post[]>(`/posts?page=${page}&limit=10`);
    return res.data;
};

export const toggleLikePost = async (postId: string): Promise<Post> => {
    const res = await API.patch<Post>(`/posts/${postId}/like`);
    return res.data;
};

export const savePost = async (postId: string): Promise<any> => {
    const res = await API.post("/saves", { postId });
    return res.data;
};

export const unsavePost = async (postId: string): Promise<any> => {
    const res = await API.delete(`/saves/${postId}`);
    return res.data;
};

export const getSavedPosts = async (): Promise<Post[]> => {
    const res = await API.get<Post[]>(`/saves`);
    return res.data;
};


// ===========================
// ========== COMMENT API ===========================
// ===========================

export const createComment = async ({
    content,
    postId,
    parentId,
}: {
    content: string;
    postId: string;
    parentId?: string;
}): Promise<PopulatedComment[]> => {
    const res = await API.post('/comments', { content, postId, parentId });
    return res.data as PopulatedComment[];
};

export const getCommentsByPost = async (postId: string): Promise<PopulatedComment[]> => {
    const res = await API.get(`/comments/${postId}`);
    return res.data as PopulatedComment[];
};

export const deleteComment = async (commentId: string) => {
    const res = await API.delete(`/comments/${commentId}`);
    return res.data;
};

// ===========================
// ========== MESSAGE API ===========================
// ===========================

export const sendMessage = async ({
    chatId,
    content,
    type = MessageType.TEXT,
}: {
    chatId: string;
    content: string;
    type?: MessageType;
}) => {
    const res = await API.post(`/messages`, { chatId, content, type });
    return res.data;
};

export const getMessagesByChatId = async (chatId: string) => {
    const res = await API.get(`/messages/${chatId}`);
    return res.data;
};

// ===========================
// ========== CHAT API ===========================
// ===========================

export const getUserChats = async () => {
    const res = await API.get(`/chats`);
    return res.data;
};

export const getChatByUserId = async (userId: string) => {
    const res = await API.get(`/chats/${userId}`);
    return res.data;
}

export const getPrivateChat = async (targetUserId: string) => {
    const res = await API.get(`/chats/${targetUserId}`);
    return res.data;
}
import { PopulatedComment } from '@/types/shared';
import axios from 'axios';

const API = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
    withCredentials: true,
});

export default API;

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

export interface User {
    _id: string;
    name: string;
    username: string;
    email: string;
    accountId: string;
    bio: string;
    imageUrl: string;
    createdAt: string;
    updatedAt: string;
}

export const loginUser = async ({ email, password }: LoginPayload): Promise<User> => {
    const res = await API.post<User>('/auth/login', { email, password });
    return res.data;
};

export const registerUser = async (userData: RegisterPayload) => {
    await API.post('/auth/register', userData);
    return await loginUser({ email: userData.email, password: userData.password });
};

export const getCurrentUser = async (): Promise<User> => {
    const res = await API.get<User>('/auth/me', { withCredentials: true });
    return res.data;
};

export const logoutUser = async () => {
    const res = await API.post('/auth/logout');
    return res.data;
};

// Gửi OTP
export const requestOtp = async ({ email }: { email: string }) => {
    const res = await API.post("/auth/request-otp", { email });
    return res.data;
};

// Xác minh OTP (Cách 2 – chỉ xác nhận)
export const verifyOtp = async ({ email, otp }: { email: string; otp: string }) => {
    const res = await API.post("/auth/verify-otp", { email, otp });
    return res.data;
};

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

export const getPostById = async (postId: string): Promise<Post> => {
    const res = await API.get(`/posts/${postId}`);
    return res.data as Post;
};

export const getUserPosts = async (userId: string): Promise<Post[]> => {
    const res = await API.get<Post[]>(`/posts/user/${userId}`);
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
    const res = await API.get<Post[]>("/saves");
    return res.data;
};

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
// types/shared.ts

export interface PopulatedUser {
    _id: string;
    name: string;
    imageUrl: string;
}

export interface PopulatedComment {
    _id: string;
    content: string;
    user: PopulatedUser;
    post: string;
    parent?: string;
    createdAt: string | Date;
    updatedAt: string | Date;
}

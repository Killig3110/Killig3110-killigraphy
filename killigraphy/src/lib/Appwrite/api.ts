import { INewPost, INewUser } from "@/types";
import { ID, ImageFormat, ImageGravity, Query } from "appwrite";
import { account, appwriteConfig, avatars, databases, storage } from "./config";

// ============================== USER ACCOUNT
export async function createUserAccount(user: INewUser) {
    try {
        const newAccount = await account.create(
            'unique()', // Unique user ID
            user.email, // User email
            user.password, // User password
            user.name, // User name
        )

        if (!newAccount) {
            throw new Error("Failed to create user account");
        }

        const avatarUrl = avatars.getInitials(user.name) // Generate avatar URL using initials

        const newUser = await saveUserToDatabase(
            {
                accountId: newAccount.$id,
                email: newAccount.email,
                name: newAccount.name,
                imageUrl: new URL(avatarUrl), // Use the generated avatar URL
                username: user.username,
            }
        )

        if (!newUser) {
            throw new Error("Failed to save user to database");
        }

        return newAccount; // Return the created account details
    } catch (error) {
        console.error(error);
        throw new Error("Error creating user account");
    }
}

// ============================== SAVE USER TO DATABASE
export async function saveUserToDatabase(user: {
    accountId: string;
    email: string;
    name: string;
    imageUrl: URL;
    username?: string;
}) {
    try {
        const newUser = await databases.createDocument(
            appwriteConfig.databaseId, // Database ID
            appwriteConfig.usersCollectionId, // Collection ID
            ID.unique(), // Unique document ID
            user, // User data
        )

        return newUser; // Return the created user document
    } catch (error) {
        console.error(error);
        throw new Error("Error saving user to database");
    }
}

// ============================== SIGN IN USER
export async function signInAccount(user: {
    email: string;
    password: string;
}) {
    try {
        const currentSession = await account.getSession("current").catch(() => null);
        if (currentSession) {
            await account.deleteSession("current");
        }

        const session = await account.createEmailPasswordSession(user.email, user.password) // Create a new session using email and password

        return session; // Return the created session
    } catch (error) {
        console.error(error);
        throw new Error("Error signing in user");
    }
}

// ============================== GET CURRENT USER
export async function getCurrentUser() {
    try {
        const currentAccount = await account.get() // Get the current user account

        if (!currentAccount) {
            throw new Error("No user account found");
        }

        const currentUser = await databases.listDocuments(
            appwriteConfig.databaseId, // Database ID
            appwriteConfig.usersCollectionId, // Collection ID
            [Query.equal('accountId', currentAccount.$id)], // Filter by account ID
        )

        if (!currentUser.documents || currentUser.documents.length === 0) {
            throw new Error("No user document found");
        }

        return currentUser.documents[0]; // Return the current account details
    } catch (error) {
        console.error(error);
        throw new Error("Error fetching current user account");
    }
}

// ============================== SIGN OUT USER
export async function signOutAccount() {
    try {
        const currentSession = await account.deleteSession("current") // Get the current session

        if (!currentSession) {
            throw new Error("No active session found");
        }

        return true; // Return true on successful sign out
    } catch (error) {
        console.error(error);
        throw new Error("Error signing out user");
    }
}

// ============================== CREATE POST
export async function createPost(post: INewPost) {
    try {
        // Upload file to appwrite storage
        const uploadedFile = await uploadFile(post.file[0]);

        if (!uploadedFile) throw new Error("File upload failed");

        // Get file url
        const fileUrl = await getFileUrl(uploadedFile.$id);
        if (!fileUrl) {
            await deleteFile(uploadedFile.$id);
            throw new Error("File URL generation failed");
        }

        // Convert tags into array
        const tags = post.tags?.replace(/ /g, "").split(",") || [];

        // Create post
        const newPost = await databases.createDocument(
            appwriteConfig.databaseId,
            appwriteConfig.postsCollectionId,
            ID.unique(),
            {
                creator: post.userId,
                caption: post.caption,
                imageURL: fileUrl,
                imageId: uploadedFile.$id,
                location: post.location,
                tags: tags,
            }
        );

        if (!newPost) {
            await deleteFile(uploadedFile.$id);
            throw new Error("Post creation failed");
        }

        return newPost;
    } catch (error) {
        console.log(error);
        throw new Error("Error creating post");
    }
}

// ============================== UPLOAD FILE
export async function uploadFile(file: File) {
    try {
        const uploadedFile = await storage.createFile(
            appwriteConfig.storageId,
            ID.unique(),
            file
        );

        return uploadedFile;
    } catch (error) {
        console.log(error);
        throw new Error("File upload failed");
    }
}

// ============================== GET FILE URL
export function getFileUrl(fileId: string) {
    try {
        const fileUrl = storage.getFileView(appwriteConfig.storageId, fileId)

        console.log(fileUrl);

        if (!fileUrl) throw new Error("File URL generation failed");
        return fileUrl;
    } catch (error) {
        console.log(error);
        throw new Error("File URL generation failed");
    }
}

// ============================== DELETE FILE
export async function deleteFile(fileId: string) {
    try {
        await storage.deleteFile(appwriteConfig.storageId, fileId);

        return { status: "ok" };
    } catch (error) {
        console.log(error);
        throw new Error("File deletion failed");
    }
}

// ============================== GET RECENT POSTS

export async function getRecentPosts() {
    const posts = await databases.listDocuments(
        appwriteConfig.databaseId,
        appwriteConfig.postsCollectionId,
        [
            Query.orderDesc("$createdAt"), Query.limit(20),
        ]
    )

    if (!posts) throw new Error("No posts found");
    return posts;
}

// ============================== LIKE / UNLIKE POST
export async function likePost(postId: string, likesArray: string[]) {
    try {
        const updatedPost = await databases.updateDocument(
            appwriteConfig.databaseId,
            appwriteConfig.postsCollectionId,
            postId,
            {
                likes: likesArray,
            }
        );

        if (!updatedPost) throw Error;

        return updatedPost;
    } catch (error) {
        console.log(error);
    }
}

// ============================== SAVE POST
export async function savePost(userId: string, postId: string) {
    try {
        const updatedPost = await databases.createDocument(
            appwriteConfig.databaseId,
            appwriteConfig.savesCollectionId,
            ID.unique(),
            {
                user: userId,
                post: postId,
            }
        );

        if (!updatedPost) throw Error;

        return updatedPost;
    } catch (error) {
        console.log(error);
    }
}
// ============================== DELETE SAVED POST
export async function deleteSavedPost(savedRecordId: string) {
    try {
        const statusCode = await databases.deleteDocument(
            appwriteConfig.databaseId,
            appwriteConfig.savesCollectionId,
            savedRecordId
        );

        if (!statusCode) throw Error;

        return { status: "Ok" };
    } catch (error) {
        console.log(error);
    }
}

// ============================== GET USER'S POST
export async function getUserPosts(userId?: string) {
    if (!userId) return;

    try {
        const post = await databases.listDocuments(
            appwriteConfig.databaseId,
            appwriteConfig.postsCollectionId,
            [Query.equal("creator", userId), Query.orderDesc("$createdAt")]
        );

        if (!post) throw Error;

        return post;
    } catch (error) {
        console.log(error);
    }
}
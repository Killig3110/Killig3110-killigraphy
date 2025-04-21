import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { checkIsLiked } from "@/lib/utils";
import {
    useToggleLikePostMutation,
    useSavePostMutation,
    useUnsavePostMutation,
    useGetSavedPostsMutation,
    useGetCommentsByPostMutation,
} from "@/lib/react-query/QueriesAndMutations";
import { Post } from "@/lib/api";

type PostStatsProps = {
    post: Post
    userId: string;
};

const PostStats = ({ post, userId }: PostStatsProps) => {
    const location = useLocation();

    const [likes, setLikes] = useState<string[]>(post.likes || []);
    const [isSaved, setIsSaved] = useState(false);

    const { mutate: toggleLike } = useToggleLikePostMutation();
    const { mutate: savePost } = useSavePostMutation();
    const { mutate: unsavePost } = useUnsavePostMutation();
    const { data: savedPosts } = useGetSavedPostsMutation();

    const { data: comments = [] } = useGetCommentsByPostMutation(post._id);

    useEffect(() => {
        const saved = savedPosts?.some((p) => p._id === post._id);
        setIsSaved(!!saved);
    }, [savedPosts, post._id]);

    const handleLikePost = (
        e: React.MouseEvent<HTMLImageElement, MouseEvent>
    ) => {
        e.stopPropagation();

        let likesArray = [...likes];

        if (likesArray.includes(userId)) {
            likesArray = likesArray.filter((Id) => Id !== userId);
        } else {
            likesArray.push(userId);
        }

        setLikes(likesArray);
        toggleLike(post._id);
    };

    const handleSavePost = (
        e: React.MouseEvent<HTMLImageElement, MouseEvent>
    ) => {
        e.stopPropagation();

        if (isSaved) {
            setIsSaved(false);
            unsavePost(post._id);
        } else {
            setIsSaved(true);
            savePost(post._id);
        }
    };

    const containerStyles = location.pathname.startsWith("/profile")
        ? "w-full"
        : "";

    return (
        <div
            className={`flex justify-between items-center z-20 ${containerStyles}`}>
            <div className="flex gap-4 items-center mr-5">
                <div className="flex gap-2 items-center">
                    <img
                        src={`${checkIsLiked(likes, userId)
                            ? "/assets/icons/liked.svg"
                            : "/assets/icons/like.svg"
                            }`}
                        alt="like"
                        width={20}
                        height={20}
                        onClick={(e) => handleLikePost(e)}
                        className="cursor-pointer"
                    />
                    <p className="small-medium lg:base-medium">{likes.length}</p>
                </div>

                <div className="flex gap-2 items-center">
                    <img
                        src="/assets/icons/comment.png"
                        alt="comment"
                        width={20}
                        height={20}
                    />
                    <p className="small-medium lg:base-medium">{comments.length}</p>
                </div>
            </div>

            <div className="flex gap-2">
                <img
                    src={isSaved ? "/assets/icons/saved.svg" : "/assets/icons/save.svg"}
                    alt="share"
                    width={20}
                    height={20}
                    className="cursor-pointer"
                    onClick={(e) => handleSavePost(e)}
                />
            </div>
        </div>
    );
};

export default PostStats;
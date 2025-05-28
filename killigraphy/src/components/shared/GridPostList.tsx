import { Link } from "react-router-dom";
import { useUserContext } from "@/context/AuthContext";
import PostStats from "./PostStats";
import { Post } from "@/lib/api";
import { useNavigate } from "react-router-dom";

type GridPostListProps = {
    posts: Post[];
    showUser?: boolean;
    showStats?: boolean;
    showCreatePostCard?: boolean;
};

const GridPostList = ({
    posts,
    showUser = true,
    showStats = true,
    showCreatePostCard = false
}: GridPostListProps) => {
    const { user } = useUserContext();
    const navigate = useNavigate();

    return (
        <ul className="grid-container">
            {showCreatePostCard && (
                <li
                    className="relative min-w-80 h-80 border-2 border-dashed border-primary-500 flex-center hover:bg-dark-4 transition cursor-pointer"
                    onClick={() => navigate("/create-post")}
                >
                    <div className="text-center">
                        <img
                            src="/assets/icons/add-post.svg"
                            alt="create"
                            className="w-8 h-8 mx-auto mb-2"
                        />
                        <p className="text-primary-500 font-semibold">Create New Post</p>
                    </div>
                </li>
            )}

            {posts.length === 0 && !showCreatePostCard && (
                <li className="col-span-full text-center text-light-3">
                    No posts available.
                </li>
            )}

            {posts.map((post) => (
                <li key={post._id} className="relative min-w-80 h-80">
                    <Link to={`/posts/${post._id}`} className="grid-post_link">
                        <img
                            src={post.imageURL}
                            alt="post"
                            className="h-full w-full object-cover"
                        />
                    </Link>

                    <div className="grid-post_user">
                        {showUser && (
                            <div className="flex items-center justify-start gap-2 flex-1">
                                <img
                                    src={
                                        post.creator.imageUrl?.startsWith("https://ik.imagekit.io/killigraphy/avatars/avatar")
                                            ? "/assets/icons/profile-placeholder.svg"
                                            : user.imageUrl || "/assets/icons/profile-placeholder.svg"
                                    }
                                    alt="creator"
                                    className="w-8 h-8 rounded-full"
                                />
                                <p className="line-clamp-1">{post.creator.name}</p>
                            </div>
                        )}
                        {showStats && <PostStats post={post} userId={user._id} />}
                    </div>
                </li>
            ))}
        </ul>
    );
};

export default GridPostList;
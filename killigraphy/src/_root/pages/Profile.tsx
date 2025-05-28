import {
    Route,
    Routes,
    Link,
    Outlet,
    useParams,
    useLocation,
    useNavigate,
} from "react-router-dom";

import { LikedPosts } from "@/_root/pages";
import { useUserContext } from "@/context/AuthContext";
import {
    useFollowersQueryMutation,
    useFollowingQuery,
    useGetUserByIdMutation,
    useGetUserPostsMutation,
    useIsFollowingQueryMutation,
    useToggleFollowMutation,
} from "@/lib/react-query/QueriesAndMutations";
import Loader from "@/components/shared/Loader";
import { Button } from "@/components/ui/button";
import GridPostList from "@/components/shared/GridPostList";

interface StatBlockProps {
    value: string | number;
    label: string;
}

// StatBlock component to display user stats like posts, followers, and following
const StatBlock = ({ value, label, onClick }: StatBlockProps & { onClick?: () => void }) => (
    <div
        className="flex-center gap-2 cursor-pointer"
        onClick={onClick}
    >
        <p className="small-semibold lg:body-bold text-primary-500">{value}</p>
        <p className="small-medium lg:base-medium text-light-2">{label}</p>
    </div>
);

const Profile = () => {
    const { userId } = useParams();
    const { user: currentUser } = useUserContext();
    const { pathname } = useLocation();
    const navigate = useNavigate();

    const { data: profileUser, isLoading: isLoadingProfile } = useGetUserByIdMutation(userId || "");
    const { data: posts = [] } = useGetUserPostsMutation(userId || "");

    const { data: followStatus, isLoading: isCheckingFollow } = useIsFollowingQueryMutation(userId || "", userId !== currentUser._id);
    const { mutateAsync: toggleFollow, isPending: isToggling } = useToggleFollowMutation();

    const { data: followersList = [] } = useFollowersQueryMutation(userId || "");
    const { data: followingList = [] } = useFollowingQuery(userId || "");

    const isSelf = currentUser._id === userId;
    const isFollowing = followStatus?.isFollowing;

    const handleFollow = async (e: React.MouseEvent) => {
        e.preventDefault();
        try {
            await toggleFollow(userId || "");
        } catch (err) {
            console.error("Toggle follow failed:", err);
        }
    };

    if (isLoadingProfile || !profileUser) {
        return (
            <div className="flex-center w-full h-full">
                <Loader />
            </div>
        );
    }

    return (
        <div className="profile-container">
            <div className="profile-inner_container">
                <div className="flex xl:flex-row flex-col max-xl:items-center flex-1 gap-7">
                    <img
                        src={
                            profileUser.imageUrl?.startsWith("https://ik.imagekit.io/killigraphy/avatars/avatar")
                                ? "/assets/icons/profile-placeholder.svg"
                                : profileUser.imageUrl || "/assets/icons/profile-placeholder.svg"
                        }
                        alt="profile"
                        className="w-28 h-28 lg:h-36 lg:w-36 rounded-full"
                    />
                    <div className="flex flex-col flex-1 justify-between md:mt-2">
                        <div className="flex flex-wrap items-center justify-center xl:justify-between gap-4 w-full">
                            <div className="flex flex-col items-center xl:items-start">
                                <h1 className="h3-bold md:h1-semibold text-white">{profileUser.name}</h1>
                                <p className="small-regular md:body-medium text-light-3">@{profileUser.username}</p>
                            </div>

                            {!isSelf ? (
                                <Button
                                    type="button"
                                    size="sm"
                                    className={`px-5 ${isFollowing ? "shad-button_dark_4" : "shad-button_primary_base"}`}
                                    onClick={handleFollow}
                                    disabled={isToggling || isCheckingFollow}
                                >
                                    {isToggling || isCheckingFollow ? "..." : isFollowing ? "Unfollow" : "Follow"}
                                </Button>
                            ) : (
                                <Link
                                    to={`/update-profile/${profileUser._id}`}
                                    className="h-10 bg-dark-4 px-4 text-light-1 flex items-center gap-2 rounded-lg"
                                >
                                    <img src="/assets/icons/edit.svg" alt="edit" width={18} height={18} />
                                    <p className="small-medium whitespace-nowrap">Edit Profile</p>
                                </Link>
                            )}
                        </div>

                        <div className="flex gap-8 mt-10 items-center justify-center xl:justify-start flex-wrap z-20">
                            <StatBlock value={posts.length} label="Posts" />
                            <StatBlock
                                value={followersList?.length || 0}
                                label="Followers"
                                onClick={() =>
                                    navigate(`/profile/${userId}/connections?tab=followers`, {
                                        state: { fromUserId: userId }
                                    })
                                }
                            />

                            <StatBlock
                                value={followingList?.length || 0}
                                label="Following"
                                onClick={() =>
                                    navigate(`/profile/${userId}/connections?tab=following`, {
                                        state: { fromUserId: userId }
                                    })
                                }
                            />
                        </div>

                        <p className="small-medium md:base-medium text-center xl:text-left mt-7 max-w-screen-sm">
                            {profileUser.bio}
                        </p>
                    </div>
                </div>
            </div>

            {isSelf && (
                <div className="flex justify-center w-full mt-6">
                    <div className="flex max-w-5xl w-full justify-center">
                        <Link
                            to={`/profile/${userId}`}
                            className={`profile-tab rounded-l-lg ${pathname === `/profile/${userId}` && "!bg-dark-3"}`}
                        >
                            <img src="/assets/icons/posts.svg" alt="posts" width={20} height={20} />
                            Posts
                        </Link>
                        <Link
                            to={`/profile/${userId}/liked-posts`}
                            className={`profile-tab rounded-r-lg ${pathname === `/profile/${userId}/liked-posts` && "!bg-dark-3"}`}
                        >
                            <img src="/assets/icons/like.svg" alt="like" width={20} height={20} />
                            Liked Posts
                        </Link>
                    </div>
                </div>
            )}

            <Routes>
                <Route index element={<GridPostList posts={posts} showUser={false} showCreatePostCard={isSelf} />} />
                {isSelf && <Route path="liked-posts" element={<LikedPosts />} />}
            </Routes>

            <Outlet />
        </div>
    );
};

export default Profile;

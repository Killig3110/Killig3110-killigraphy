import { Link } from "react-router-dom";

import { Button } from "../ui/button";
import { User } from "@/lib/api";
import { useUserContext } from "@/context/AuthContext";
import { useIsFollowingQueryMutation, useToggleFollowMutation } from "@/lib/react-query/QueriesAndMutations";

type UserCardProps = {
    user: User
};

const UserCard = ({ user }: UserCardProps) => {
    const { user: currentUser } = useUserContext()
    const { data: followStatus, isLoading: isChecking } = useIsFollowingQueryMutation(user._id, user._id !== currentUser._id);
    const { mutateAsync: toggleFollow, isPending: isToggling } = useToggleFollowMutation();

    const handleFollow = async (e: React.MouseEvent) => {
        e.preventDefault();
        await toggleFollow(user._id);
    };

    const isSelf = currentUser._id === user._id;
    const isFollowing = followStatus?.isFollowing;

    return (
        <Link to={`/profile/${user._id}`} className="user-card">
            <img
                src={
                    user.imageUrl?.startsWith("https://ik.imagekit.io/killigraphy/avatars/avatar")
                        ? "/assets/icons/profile-placeholder.svg"
                        : user.imageUrl || "/assets/icons/profile-placeholder.svg"
                }
                alt="creator"
                className="rounded-full w-14 h-14"
            />

            <div className="flex-center flex-col gap-1">
                <p className="base-medium text-light-1 text-center line-clamp-1">
                    {user.name}
                </p>
                <p className="small-regular text-light-3 text-center line-clamp-1">
                    @{user.username}
                </p>
            </div>

            {!isSelf && (
                <Button
                    type="button"
                    size="sm"
                    className={`px-5 ${isFollowing ? ".shad-button_dark_4_primary" : "shad-button_primary"}`}
                    onClick={handleFollow}
                    disabled={isToggling || isChecking}
                >
                    {isToggling || isChecking ? "..." : isFollowing ? "Unfollow" : "Follow"}
                </Button>
            )}
        </Link>
    );
};

export default UserCard;
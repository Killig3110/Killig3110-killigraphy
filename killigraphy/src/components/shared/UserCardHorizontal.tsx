import { Link } from "react-router-dom";
import { Button } from "../ui/button";
import { User } from "@/lib/api";
import { useUserContext } from "@/context/AuthContext";

type Props = {
    user: User;
    isFollowing: boolean;
    onToggleFollow: () => void;
};

const UserCardHorizontal = ({ user, isFollowing, onToggleFollow }: Props) => {
    const { user: currentUser } = useUserContext();
    const isSelf = currentUser._id === user._id;

    return (
        <div className="flex items-center justify-between gap-3 px-3 py-2 bg-dark-3 rounded-md">
            <Link
                to={`/profile/${user._id}`}
                className="flex items-center gap-3 flex-1"
            >
                <img
                    src={
                        user.imageUrl?.startsWith("https://ik.imagekit.io/killigraphy/avatars/avatar")
                            ? "/assets/icons/profile-placeholder.svg"
                            : user.imageUrl || "/assets/icons/profile-placeholder.svg"
                    }
                    alt={user.name}
                    className="w-10 h-10 rounded-full object-cover"
                />
                <div>
                    <p className="text-sm font-semibold">{user.name}</p>
                    <p className="text-xs text-light-3">@{user.username}</p>
                </div>
            </Link>

            {!isSelf && (
                <Button
                    size="sm"
                    className={`text-xs ${isFollowing ? "shad-button_dark_4_primary" : "shad-button_primary"
                        }`}
                    onClick={onToggleFollow}
                >
                    {isFollowing ? "Unfollow" : "Follow"}
                </Button>
            )}
        </div>
    );
};

export default UserCardHorizontal;

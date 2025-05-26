import { useParams } from "react-router-dom";
import Loader from "./Loader";
import UserCard from "./UserCard";
import UserCardHorizontal from "./UserCardHorizontal";
import {
    useFollowersQueryMutation,
    useFollowingQuery,
} from "@/lib/react-query/QueriesAndMutations";
import { User } from "@/lib/api";
import { useEffect } from "react";

type FollowState = {
    initial: boolean;
    current: boolean;
};

type Props = {
    type: "followers" | "following";
    layout?: "horizontal" | "vertical";
    localFollowMap: Record<string, FollowState>;
    onInitFollowState: (users: User[]) => void;
    onToggleFollow: (userId: string) => void;
};

const UserList = ({
    type,
    layout = "vertical",
    localFollowMap,
    onInitFollowState,
    onToggleFollow,
}: Props) => {
    const { id } = useParams();

    const followersQuery = useFollowersQueryMutation(id!);
    const followingQuery = useFollowingQuery(id!);

    const data =
        type === "followers"
            ? followersQuery.data
            : followingQuery.data || [];

    const isLoading =
        type === "followers"
            ? followersQuery.isLoading
            : followingQuery.isLoading;

    useEffect(() => {
        if (data && onInitFollowState) {
            onInitFollowState(data);
        }
    }, [data]);

    if (isLoading) return <Loader />;

    return (
        <div className="w-full mt-4">
            <h2 className="h3-bold mb-4">
                {type === "followers" ? "Followers" : "Following"}
            </h2>

            {data?.length === 0 ? (
                <p className="text-light-4">No {type} found.</p>
            ) : (
                <ul className="flex flex-col gap-3">
                    {(data ?? []).map((u) =>
                        layout === "horizontal" ? (
                            <UserCardHorizontal
                                key={u._id}
                                user={u}
                                isFollowing={localFollowMap[u._id]?.current ?? false}
                                onToggleFollow={() => onToggleFollow(u._id)}
                            />
                        ) : (
                            <UserCard key={u._id} user={u} />
                        )
                    )}
                </ul>
            )}
        </div>
    );
};

export default UserList;

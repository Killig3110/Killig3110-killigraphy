import Loader from "./Loader";
import UserCard from "./UserCard";
import UserCardHorizontal from "./UserCardHorizontal";
import {
    useFollowersQueryMutation,
    useFollowingQuery,
} from "@/lib/react-query/QueriesAndMutations";
import { User } from "@/lib/api";
import { useEffect, useRef, useCallback } from "react";

type FollowState = {
    initial: boolean;
    current: boolean;
};

type Props = {
    userId: string;
    type: "followers" | "following" | "suggestions";
    layout?: "horizontal" | "vertical" | "grid";
    overrideUsers?: User[];
    localFollowMap: Record<string, FollowState>;
    onInitFollowState: (users: User[]) => void;
    onToggleFollow: (userId: string) => void;
    enableInfiniteScroll?: boolean;
    onLoadMore?: () => void;
    hasMore?: boolean;
    isLoadingMore?: boolean;
};

const UserList = ({
    userId,
    type,
    layout = "vertical",
    localFollowMap,
    onInitFollowState,
    onToggleFollow,
    overrideUsers,
    enableInfiniteScroll = false,
    onLoadMore,
    hasMore,
    isLoadingMore,
}: Props) => {
    const followersQuery = useFollowersQueryMutation(userId);
    const followingQuery = useFollowingQuery(userId);

    const data = overrideUsers ?? (
        type === "followers"
            ? followersQuery.data
            : type === "following"
                ? followingQuery.data
                : []
    );

    const isLoading = overrideUsers
        ? false
        : type === "followers"
            ? followersQuery.isLoading
            : type === "following"
                ? followingQuery.isLoading
                : false;

    const usersToShow = overrideUsers ?? data ?? [];

    useEffect(() => {
        if (data && onInitFollowState) {
            onInitFollowState(data);
        }
    }, [data]);

    const observer = useRef<IntersectionObserver | null>(null);
    const lastElementRef = useCallback(
        (node: HTMLDivElement | null) => {
            if (!enableInfiniteScroll || !hasMore || isLoadingMore) return;

            if (observer.current) observer.current.disconnect();

            observer.current = new IntersectionObserver((entries) => {
                if (entries[0].isIntersecting && onLoadMore) {
                    onLoadMore();
                }
            });

            if (node) observer.current.observe(node);
        },
        [enableInfiniteScroll, hasMore, isLoadingMore]
    );

    if (isLoading) return <Loader />;

    return (
        <div className="w-full mt-4">
            {type !== "suggestions" && (
                <h2 className="h3-bold mb-4">
                    {type === "followers" ? "Followers" : "Following"}
                </h2>
            )}

            {usersToShow.length === 0 ? (
                <p className="text-light-4">No {type} found.</p>
            ) : (
                <ul
                    className={
                        layout === "grid"
                            ? "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4"
                            : "flex flex-col gap-3"
                    }
                >
                    {usersToShow.map((u, idx) => {
                        const isLast = idx === usersToShow.length - 1;

                        const card = layout === "horizontal" ? (
                            <UserCardHorizontal
                                key={u._id}
                                user={u}
                                isFollowing={localFollowMap[u._id]?.current ?? false}
                                onToggleFollow={() => onToggleFollow(u._id)}
                            />
                        ) : (
                            <UserCard key={u._id} user={u} />
                        );

                        return (
                            <div
                                key={u._id}
                                ref={enableInfiniteScroll && isLast ? lastElementRef : null}
                            >
                                {card}
                            </div>
                        );
                    })}
                </ul>
            )}

            {isLoadingMore && (
                <div className="mt-4">
                    <Loader />
                </div>
            )}
        </div>
    );
};

export default UserList;

import { useSearchParams, useParams, useNavigate } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import UserList from "@/components/shared/UserList";
import { User } from "@/lib/api";
import { useSuggestedUsersInfiniteQuery, useToggleFollowMutation } from "@/lib/react-query/QueriesAndMutations";
import Loader from "@/components/shared/Loader";

type FollowState = {
    initial: boolean;
    current: boolean;
};

const ProfileConnections = () => {
    const navigate = useNavigate();
    const { userId } = useParams();
    const [searchParams, setSearchParams] = useSearchParams();
    const tab = searchParams.get("tab") as "followers" | "following" | null;

    const [activeTab, setActiveTab] = useState<"followers" | "following">("followers");
    const [localFollowMap, setLocalFollowMap] = useState<Record<string, FollowState>>({});
    const [allUsers, setAllUsers] = useState<User[]>([]);
    const [searchTerm, setSearchTerm] = useState("");

    const { mutateAsync: toggleFollowApi } = useToggleFollowMutation();

    const {
        data: suggestedPages,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
    } = useSuggestedUsersInfiniteQuery(userId!);

    const suggestedUsers = useMemo(
        () => suggestedPages?.pages.flat() ?? [],
        [suggestedPages]
    );

    // Sync các follow thay đổi với backend
    const syncPendingChanges = async () => {
        const entries = Object.entries(localFollowMap);
        for (const [userId, { initial, current }] of entries) {
            if (initial !== current) {
                try {
                    await toggleFollowApi(userId);
                } catch (err) {
                    console.error("Failed to sync follow state for", userId);
                }
            }
        }
    };

    // Đồng bộ khi unmount trang
    useEffect(() => {
        return () => {
            syncPendingChanges();
        };
    }, []);

    // Đồng bộ khi chuyển tab
    const handleTabClick = async (tab: "followers" | "following") => {
        await syncPendingChanges();
        setSearchParams({ tab });
        setSearchTerm("");
    };

    useEffect(() => {
        if (tab === "following" || tab === "followers") {
            setActiveTab(tab);
            setAllUsers([]);
        }
    }, [tab]);

    const handleInitFollowState = (users: User[]) => {
        const map: Record<string, FollowState> = {};
        const defaultFollowState = activeTab === "following" ? true : false;

        users.forEach((u) => {
            const isFollowing = u.isFollowing ?? defaultFollowState;
            map[u._id] = {
                initial: isFollowing,
                current: isFollowing,
            };
        });
        setLocalFollowMap(map);
        setAllUsers(users);
    };

    const handleInitSuggestedFollowState = (users: User[]) => {
        setLocalFollowMap((prev) => {
            const map = { ...prev };
            users.forEach((u) => {
                if (!map[u._id]) {
                    map[u._id] = {
                        initial: u.isFollowing ?? false,
                        current: u.isFollowing ?? false,
                    };
                }
            });
            return map;
        });
    };

    const toggleLocalFollow = (userId: string) => {
        setLocalFollowMap((prev) => {
            const userFollow = prev[userId];
            if (!userFollow) return prev; // 👈 tránh lỗi
            return {
                ...prev,
                [userId]: {
                    ...userFollow,
                    current: !userFollow.current,
                },
            };
        });
    };

    const filteredUsers = useMemo(() => {
        return allUsers.filter((u) =>
            u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            u.username.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [searchTerm, allUsers]);

    const filteredSuggestedUsers = useMemo(() => {
        return suggestedUsers.filter(
            (u) => !allUsers.some((existing) => existing._id === u._id)
        );
    }, [suggestedUsers, allUsers]);

    const isSearching = searchTerm.trim().length > 0;

    return (
        <div className="common-container">
            <div className="user-container">
                <section className="max-w-3xl w-full mx-auto px-4 py-8">
                    <div className="bg-dark-2 h-full rounded-xl shadow-md p-6">
                        <div className="flex justify-between items-center mb-6">
                            <h1 className="h2-bold text-white">Connections</h1>
                            <button
                                onClick={async () => {
                                    await syncPendingChanges();
                                    navigate(`/profile/${userId}`);
                                }}
                                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-dark-4 hover:bg-dark-3 transition"
                            >
                                <img src="/assets/icons/back.svg" alt="back" className="w-4 h-4" />
                                <span className="text-sm text-light-1">Back to Profile</span>
                            </button>
                        </div>

                        {/* Tabs */}
                        <div className="flex justify-center gap-6 mb-6 border-b border-dark-4 pb-2">
                            {["followers", "following"].map((t) => (
                                <button
                                    key={t}
                                    className={`pb-1 transition font-medium ${activeTab === t
                                        ? "border-b-2 border-primary-500 text-white"
                                        : "text-light-3"
                                        }`}
                                    onClick={() => handleTabClick(t as any)}
                                >
                                    {t.charAt(0).toUpperCase() + t.slice(1)}
                                </button>
                            ))}
                        </div>

                        {/* Search bar */}
                        <div className="mb-4">
                            <input
                                type="text"
                                placeholder={`Search ${activeTab}`}
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full px-4 py-2 rounded-lg bg-dark-4 text-light-1 placeholder:text-light-3 outline-none"
                            />
                        </div>

                        {/* User List */}
                        <UserList
                            userId={userId!}
                            type={activeTab}
                            layout="horizontal"
                            localFollowMap={localFollowMap}
                            onInitFollowState={handleInitFollowState}
                            onToggleFollow={toggleLocalFollow}
                            overrideUsers={isSearching ? filteredUsers : undefined}
                        />

                        {/* Suggestions */}
                        {suggestedUsers.length === 0 && isFetchingNextPage && <Loader />}
                        {suggestedUsers.length > 0 && (
                            <div className="mt-10">
                                <h2 className="h3-bold text-white mb-3">Suggested for you</h2>

                                <UserList
                                    userId={userId!}
                                    type="suggestions"
                                    layout="horizontal"
                                    localFollowMap={localFollowMap}
                                    onInitFollowState={handleInitSuggestedFollowState}
                                    onToggleFollow={toggleLocalFollow}
                                    overrideUsers={filteredSuggestedUsers}
                                    enableInfiniteScroll
                                    onLoadMore={fetchNextPage}
                                    hasMore={hasNextPage}
                                    isLoadingMore={isFetchingNextPage}
                                />
                            </div>
                        )}
                    </div>
                </section>
            </div>
        </div>
    );
};

export default ProfileConnections;

import { useToast } from "@/hooks/use-toast";
import { useInfiniteUsersMutation } from "@/lib/react-query/QueriesAndMutations";
import UserList from "@/components/shared/UserList";
import { useState, useMemo } from "react";
import { User } from "@/lib/api";
import Loader from "@/components/shared/Loader";

type FollowState = {
    initial: boolean;
    current: boolean;
};

const AllUsers = () => {
    const { toast } = useToast();
    const {
        data,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
        isPending: isLoading,
        isError,
    } = useInfiniteUsersMutation();

    const [localFollowMap, setLocalFollowMap] = useState<Record<string, FollowState>>({});

    const flatUsers = useMemo(() => data?.pages.flat() ?? [], [data]);

    const [searchTerm, setSearchTerm] = useState("");

    const filteredUsers = useMemo(() => {
        return flatUsers.filter((u) =>
            u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            u.username.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [searchTerm, flatUsers]);

    const handleInitFollowState = (users: User[]) => {
        const map: Record<string, FollowState> = {};
        users.forEach((u) => {
            map[u._id] = { initial: false, current: false }; // all are not followed initially
        });
        setLocalFollowMap(map);
    };

    const toggleLocalFollow = (userId: string) => {
        setLocalFollowMap((prev) => ({
            ...prev,
            [userId]: {
                ...prev[userId],
                current: !prev[userId].current,
            },
        }));
    };

    if (isError) {
        toast({
            title: "Error",
            description: "Something went wrong while fetching users.",
            variant: "destructive",
        });
        return <div>Error fetching users</div>;
    }

    return (
        <div className="common-container">
            <div className="user-container">
                <div className="flex flex-col gap-4 w-full">
                    {/* Header with icon + title */}
                    <div className="flex items-center gap-3">
                        <h2 className="h3-bold md:h2-bold text-white">Discover New People</h2>
                    </div>

                    {/* Search input */}
                    <input
                        type="text"
                        placeholder="Search users..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full px-4 py-2 rounded-lg bg-dark-4 text-light-1 placeholder:text-light-3 outline-none"
                    />
                </div>

                {/* User list */}
                {isLoading && !data ? (
                    <Loader />
                ) : flatUsers.length === 0 ? (
                    <p className="text-light-4 mt-10 text-center w-full">No people found.</p>
                ) : (
                    <UserList
                        userId="dummy"
                        type="suggestions"
                        layout="grid"
                        overrideUsers={filteredUsers}
                        localFollowMap={localFollowMap}
                        onInitFollowState={handleInitFollowState}
                        onToggleFollow={toggleLocalFollow}
                        enableInfiniteScroll
                        onLoadMore={fetchNextPage}
                        hasMore={hasNextPage}
                        isLoadingMore={isFetchingNextPage}
                    />
                )}
            </div>
        </div>
    );
};

export default AllUsers;

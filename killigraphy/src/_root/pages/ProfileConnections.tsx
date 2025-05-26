import { useSearchParams, useParams, useNavigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import UserList from "@/components/shared/UserList";
import { User } from "@/lib/api";

type FollowState = {
    initial: boolean;
    current: boolean;
};

const ProfileConnections = () => {
    const location = useLocation();
    const navigate = useNavigate();

    const { userId: paramId } = useParams();
    const fromStateId = (location.state as { fromUserId?: string })?.fromUserId;
    const userId = fromStateId || paramId;

    const [searchParams, setSearchParams] = useSearchParams();
    const tab = searchParams.get("tab") as "followers" | "following" | null;

    const [activeTab, setActiveTab] = useState<"followers" | "following">("followers");
    const [localFollowMap, setLocalFollowMap] = useState<Record<string, FollowState>>({});

    useEffect(() => {
        if (tab === "following" || tab === "followers") {
            setActiveTab(tab);
        }
    }, [tab]);

    const handleTabClick = (tab: "followers" | "following") => {
        setSearchParams({ tab });
    };

    const handleInitFollowState = (users: User[]) => {
        const map: Record<string, FollowState> = {};
        users.forEach((u) => {
            map[u._id] = {
                initial: activeTab === "following",
                current: activeTab === "following",
            };
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

    return (
        <section className="max-w-3xl w-full mx-auto px-4 py-8">
            <div className="bg-dark-2 h-full rounded-xl shadow-md p-6">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="h2-bold text-white">Connections</h1>
                    <button
                        onClick={() => navigate(`/profile/${userId}`)}
                        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-dark-4 hover:bg-dark-3 transition"
                    >
                        <img src="/assets/icons/back.svg" alt="back" className="w-4 h-4" />
                        <span className="text-sm text-light-1">Back to Profile</span>
                    </button>
                </div>

                <div className="flex justify-center gap-6 mb-6 border-b border-dark-4 pb-2">
                    <button
                        className={`pb-1 transition font-medium ${activeTab === "followers"
                            ? "border-b-2 border-primary-500 text-white"
                            : "text-light-3"
                            }`}
                        onClick={() => handleTabClick("followers")}
                    >
                        Followers
                    </button>
                    <button
                        className={`pb-1 transition font-medium ${activeTab === "following"
                            ? "border-b-2 border-primary-500 text-white"
                            : "text-light-3"
                            }`}
                        onClick={() => handleTabClick("following")}
                    >
                        Following
                    </button>
                </div>

                <UserList
                    type={activeTab}
                    layout="horizontal"
                    localFollowMap={localFollowMap}
                    onInitFollowState={handleInitFollowState}
                    onToggleFollow={toggleLocalFollow}
                />
            </div>
        </section>
    );
};

export default ProfileConnections;

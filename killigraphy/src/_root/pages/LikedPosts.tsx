import GridPostList from "@/components/shared/GridPostList";
import Loader from "@/components/shared/Loader";
import { useUserContext } from "@/context/AuthContext";
import { Post } from "@/lib/api";
import { useGetListPostsMutation } from "@/lib/react-query/QueriesAndMutations";

const LikedPosts = () => {
    const { user } = useUserContext();

    const { data: likedPosts, isPending } = useGetListPostsMutation(user?.likedPosts ?? []);

    if (!user || isPending) {
        return (
            <div className="flex-center w-full h-full">
                <Loader />
            </div>
        );
    }

    if (!likedPosts || likedPosts.length === 0) {
        return <p className="text-light-4">No liked posts</p>;
    }

    return (
        <GridPostList posts={likedPosts as Post[]} showStats={false} />
    );
};

export default LikedPosts;

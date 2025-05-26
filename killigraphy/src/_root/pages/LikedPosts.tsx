import GridPostList from "@/components/shared/GridPostList";
import Loader from "@/components/shared/Loader";
import { useUserContext } from "@/context/AuthContext";
import { Post } from "@/lib/api";
import { useGetListPostsMutation } from "@/lib/react-query/QueriesAndMutations";

const LikedPosts = () => {
    const { user } = useUserContext()
    const { data: likedPosts } = useGetListPostsMutation(user.likedPosts as string[]);

    if (!user)
        return (
            <div className="flex-center w-full h-full">
                <Loader />
            </div>
        );

    return (
        <>
            {(user.likedPosts ?? []).length === 0 ? (
                <p className="text-light-4">No liked posts</p>
            ) : (
                <GridPostList posts={likedPosts as Post[]} showStats={false} />
            )}
        </>
    );
};

export default LikedPosts;
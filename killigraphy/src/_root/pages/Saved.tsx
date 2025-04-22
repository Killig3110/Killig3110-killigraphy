import GridPostList from "@/components/shared/GridPostList";
import Loader from "@/components/shared/Loader";
import { Post } from "@/lib/api";
import { useGetCurrentUserMutation, useGetSavedPostsMutation } from "@/lib/react-query/QueriesAndMutations";


const Saved = () => {
    const { data: currentUser } = useGetCurrentUserMutation();
    const { data: savePosts } = useGetSavedPostsMutation() as { data: Post[] };

    return (
        <div className="saved-container">
            <div className="flex gap-2 w-full max-w-5xl">
                <img
                    src="/assets/icons/save.svg"
                    width={36}
                    height={36}
                    alt="edit"
                    className="invert-white"
                />
                <h2 className="h3-bold md:h2-bold text-left w-full">Saved Posts</h2>
            </div>

            {!currentUser ? (
                <Loader />
            ) : (
                <div className="w-full flex justify-center max-w-5xl gap-9">
                    {savePosts.length === 0 ? (
                        <p className="text-light-4">No available posts</p>
                    ) : (
                        <GridPostList posts={savePosts} showStats={false} />
                    )}
                </div>
            )}
        </div>
    );
};

export default Saved;
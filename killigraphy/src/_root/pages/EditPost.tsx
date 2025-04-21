import PostForm from "@/components/forms/PostForm"
import Loader from "@/components/shared/Loader"
import { useGetPostByIdMutation } from "@/lib/react-query/QueriesAndMutations"
import { useParams } from "react-router-dom"

const EditPost = () => {
    const { postId } = useParams() as { postId: string }
    const { data: post, isPending, isError } = useGetPostByIdMutation(postId)

    if (!postId) return <div className="text-red-500">Post ID not found</div>;
    if (isPending) return <div className="flex flex-1"><Loader /></div>;
    if (isError || !post) return <div className="text-red-500">Failed to load post</div>;

    if (isPending) return <div className="flex flex-1"><Loader /></div>

    return (
        <div className="flex flex-1">
            <div className="common-container">
                <div className="max-w-5xl flex-start gap-3 justify-start w-full">
                    <img
                        src='/assets/icons/add-post.svg'
                        alt='create-post'
                        className="w-10 h-10"
                    />
                    <h2 className="h3-bold md:h2-bold text-left w-full">
                        Edit Post
                    </h2>
                </div>
                <PostForm action="Update" post={post} />
            </div>
        </div>
    )
}

export default EditPost
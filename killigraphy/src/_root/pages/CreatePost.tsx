import PostForm from "@/components/forms/PostForm"
import { useLocation } from "react-router-dom";

const CreatePost = () => {
    const location = useLocation();
    const prefillCaption = location.state?.prefillCaption || "";
    const prefillFile = location.state?.prefillFile || null;
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
                        Create Post
                    </h2>
                </div>
                <PostForm action="Create" prefillCaption={prefillCaption} prefillFile={prefillFile} />
            </div>
        </div>
    )
}

export default CreatePost
import { useUserContext } from '@/context/AuthContext'
import { multiFormatDateString } from '@/lib/utils'
import { Link } from 'react-router-dom'
import PostStats from './PostStats'
import { Post } from '@/lib/api'
import PostCommentsPreview from './PostCommentsPreview'
import CommentInput from './CommentInput'
import { useGetCommentsByPostMutation } from '@/lib/react-query/QueriesAndMutations'

type PostCardProps = {
    post: Post
}

const PostCard = ({ post }: PostCardProps) => {
    const { user } = useUserContext()
    const { data: comments = [] } = useGetCommentsByPostMutation(post._id);

    return (
        <div className='post-card'>
            <div className='flex-between'>
                <div className='flex items-center gap-3'>
                    <Link to={`/profile/${post?.creator?._id}`}>
                        <img
                            src={
                                post.creator.imageUrl?.startsWith("https://ik.imagekit.io/killigraphy/avatars/avatar")
                                    ? "/assets/icons/profile-placeholder.svg"
                                    : post.creator.imageUrl || "/assets/icons/profile-placeholder.svg"
                            }
                            alt="Creator Image"
                            className='w-10 h-10 rounded-full lg:h-12'
                        />
                    </Link>

                    <div className='flex flex-col'>
                        <p className='base-medium lg:body-bold text-light-1'>{post?.creator?.name || 'Anonymous'}</p>

                        <div className='flex-center gap-2 text-light-3'>
                            <p className='subtle-semibold lg:small-regular'>{multiFormatDateString(post?.createdAt)}</p>
                            -
                            <p className='subtle-semibold lg:small-regular'>{post?.location}</p>
                        </div>
                    </div>
                </div>
                <Link to={`/update-post/${post._id}`}
                    className={`${user?._id !== post?.creator._id && 'hidden'}`}
                >
                    <img
                        src='/assets/icons/edit.svg'
                        alt="Edit Icon"
                        className='w-8 h-8 lg:w-8 lg:h-8'
                    />
                </Link>
            </div>

            <Link to={`/posts/${post._id}`} className='flex flex-col gap-3'>
                <div className='small-medium lg:base-medium py-5'>
                    <p style={{ whiteSpace: 'pre-line' }}>{post?.caption}</p>
                    <ul className='flex gap-1 mt-2'>
                        {post?.tags?.map((tag: string) => (
                            <li key={tag} className='text-light-3'>
                                #{tag}
                            </li>
                        ))}
                    </ul>
                </div>
                <img
                    src={post?.imageURL || '/assets/icons/profile-placeholder.svg'}
                    alt="Post Image"
                    className='post-card_img'
                />
            </Link>

            <PostStats post={post} userId={user?._id} />
            <PostCommentsPreview postId={post._id} />

            {comments.length <= 1 && (
                <CommentInput postId={post._id} />
            )}
        </div>
    )
}

export default PostCard
import Loader from '@/components/shared/Loader';
import PostCard from '@/components/shared/PostCard';
import { useGetRecentPostsMutation } from '@/lib/react-query/QueriesAndMutations';
import { Post } from '@/lib/api';

const Home = () => {
  const {
    data: posts,
    isPending: isPostLoading,
    isError: isErrorPosts,
  } = useGetRecentPostsMutation();

  return (
    <div className='flex flex-1'>
      <div className='home-container'>
        <div className='home-posts'>
          <h2 className='h3-bold md:h2-bold text-left w-full'>Home Feed</h2>

          {isPostLoading && !posts ? (
            <Loader />
          ) : (
            <ul className='flex flex-col flex-1 gap-9 w-full'>
              {posts?.map((post: Post) => (
                <PostCard key={post._id} post={post} />
              ))}
            </ul>
          )}

          {isErrorPosts && <p className="text-red-500">Failed to load posts.</p>}
        </div>
      </div>
    </div>
  );
};

export default Home;

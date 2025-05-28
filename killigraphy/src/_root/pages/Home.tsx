import { useEffect, useRef } from 'react';
import Loader from '@/components/shared/Loader';
import PostCard from '@/components/shared/PostCard';
import { Post } from '@/lib/api';
import { useGetFeedPersonalizedMutation } from '@/lib/react-query/QueriesAndMutations';

const Home = () => {
  const {
    data,
    isPending,
    isError,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useGetFeedPersonalizedMutation();

  const posts = data?.pages.flat() ?? [];

  // Use IntersectionObserver instead of scroll event
  const loaderRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { threshold: 1 }
    );

    const current = loaderRef.current;
    if (current) observer.observe(current);

    return () => {
      if (current) observer.unobserve(current);
    };
  }, [hasNextPage, isFetchingNextPage]);

  return (
    <div className='flex flex-1'>
      <div className='home-container'>
        <div className='home-posts'>
          <h2 className='h3-bold md:h2-bold text-left w-full'>Home Feed</h2>

          {isPending && posts.length === 0 ? (
            <Loader />
          ) : (
            <ul className='flex flex-col flex-1 gap-9 w-full'>
              {posts.length === 0 && (
                <p className='text-light-4'>No available posts</p>
              )}
              {posts.map((post: Post) => (
                <PostCard key={post._id} post={post} />
              ))}
            </ul>
          )}

          {isFetchingNextPage && (
            <div className="mt-4">
              <Loader />
            </div>
          )}

          {isError && <p className="text-red-500 mt-4">Failed to load posts.</p>}

          {/* Ref target for lazy loading */}
          <div ref={loaderRef} className="h-10" />
        </div>
      </div>
    </div>
  );
};

export default Home;

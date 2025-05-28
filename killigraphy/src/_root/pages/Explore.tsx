import { useEffect, useState } from "react";
import { useInView } from "react-intersection-observer";
import GridPostList from "@/components/shared/GridPostList";
import Loader from "@/components/shared/Loader";
import { Input } from "@/components/ui/input";
import useDebounce from "@/hooks/useDebounce";
import {
    useInfinitePostsMutation,
    usePostMetaMutation,
    useSearchPostsMutation,
} from "@/lib/react-query/QueriesAndMutations";

const Explore = () => {
    const [searchValue, setSearchValue] = useState("");
    const debouncedQuery = useDebounce(searchValue, 500);
    const { data: postMeta } = usePostMetaMutation();
    const tagOptions = postMeta?.pages?.[0]?.tags || [];
    const locationOptions = postMeta?.pages?.[0]?.locations || [];

    const [showAllTags, setShowAllTags] = useState(false);
    const MAX_VISIBLE_TAGS = 10;
    const visibleTags = showAllTags ? tagOptions : tagOptions.slice(0, MAX_VISIBLE_TAGS);

    const [filters, setFilters] = useState({
        tags: [] as string[],
        location: "",
        sort: "latest",
    });

    const {
        data: infinitePosts,
        fetchNextPage,
        hasNextPage,
        isPending: isFetchingPosts,
    } = useInfinitePostsMutation();

    const { ref, inView } = useInView();

    const {
        data: searchResults,
        isPending: isSearching,
    } = useSearchPostsMutation({
        query: debouncedQuery.trim(),
        tags: filters.tags,
        location: filters.location,
        sort: filters.sort as "latest" | "popular",
    });

    const shouldShowSearch =
        !!debouncedQuery || filters.tags.length > 0 || !!filters.location;

    useEffect(() => {
        if (inView && !shouldShowSearch && hasNextPage) {
            fetchNextPage();
        }
    }, [inView, shouldShowSearch, hasNextPage]);

    const toggleTag = (tag: string) => {
        setFilters((prev) => {
            const exists = prev.tags.includes(tag);
            return {
                ...prev,
                tags: exists ? prev.tags.filter((t) => t !== tag) : [...prev.tags, tag],
            };
        });
    };

    return (
        <div className="explore-container px-4 py-6 min-h-screen">
            <div className="max-w-6xl mx-auto">
                <h2 className="h2-bold text-left mb-6">Explore</h2>

                {/* Search Bar */}
                <div className="flex gap-3 items-center bg-dark-3 rounded-xl px-4 py-3 mb-6">
                    <img src="/assets/icons/search.svg" alt="search" className="w-5 h-5 opacity-70" />
                    <Input
                        type="text"
                        placeholder="Tìm kiếm..."
                        className="bg-transparent text-white border-none focus-visible:ring-0"
                        value={searchValue}
                        onChange={(e) => setSearchValue(e.target.value)}
                    />
                </div>

                {/* Filters Section */}
                <div className="bg-dark-2 rounded-xl p-5 space-y-4 shadow-md">
                    <div className="flex flex-wrap items-center gap-4">
                        <select
                            className="bg-dark-3 text-light-2 px-3 py-2 rounded-md"
                            value={filters.sort}
                            onChange={(e) => setFilters({ ...filters, sort: e.target.value })}
                        >
                            <option value="latest">Latest</option>
                            <option value="popular">Popular</option>
                        </select>

                        <select
                            className="bg-dark-3 text-light-2 px-3 py-2 rounded-md"
                            value={filters.location}
                            onChange={(e) => setFilters({ ...filters, location: e.target.value })}
                        >
                            <option value="">All Location</option>
                            {locationOptions.map((loc) => (
                                <option key={loc} value={loc}>
                                    {loc.length > 18 ? loc.slice(0, 15) + "..." : loc}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Tags */}
                    <div className="space-y-3">
                        <div className="flex flex-wrap gap-2 transition-all duration-300 overflow-hidden">
                            {visibleTags.map((tag) => (
                                <button
                                    key={tag}
                                    onClick={() => toggleTag(tag)}
                                    className={`px-3 py-1 rounded-full text-sm whitespace-nowrap border ${filters.tags.includes(tag)
                                        ? "bg-primary-500 text-white"
                                        : "bg-dark-3 text-light-2"
                                        }`}
                                >
                                    #{tag}
                                </button>
                            ))}
                        </div>

                        {tagOptions.length > MAX_VISIBLE_TAGS && (
                            <button
                                onClick={() => setShowAllTags(!showAllTags)}
                                className="text-sm text-light-4 underline"
                            >
                                {showAllTags ? "Ẩn bớt" : "Xem thêm"}
                            </button>
                        )}
                    </div>
                </div>

                {/* Results */}
                <div className="mt-10">
                    {shouldShowSearch ? (
                        isSearching ? (
                            <Loader />
                        ) : searchResults?.length ? (
                            <GridPostList posts={searchResults} />
                        ) : (
                            <p className="text-light-4 text-center mt-10">Không tìm thấy kết quả.</p>
                        )
                    ) : isFetchingPosts ? (
                        <Loader />
                    ) : (
                        infinitePosts?.pages.map((group, i) => (
                            <GridPostList key={`page-${i}`} posts={group} />
                        ))
                    )}

                    {hasNextPage && !shouldShowSearch && (
                        <div ref={ref} className="mt-6 flex justify-center">
                            <Loader />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Explore;

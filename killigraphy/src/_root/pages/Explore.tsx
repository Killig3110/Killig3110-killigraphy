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
    const tagOptions = postMeta?.tags || [];
    const locationOptions = postMeta?.locations || [];

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
        <div className="explore-container">
            <div className="explore-inner_container">
                <h2 className="h3-bold md:h2-bold w-full">Search Posts</h2>

                <div className="flex gap-1 px-4 w-full rounded-lg bg-dark-4">
                    <img
                        src="/assets/icons/search.svg"
                        alt="search"
                        className="w-8 h-8 lg:w-10 lg:h-10"
                    />
                    <Input
                        type="text"
                        placeholder="Search"
                        className="explore-search"
                        value={searchValue}
                        onChange={(e) => setSearchValue(e.target.value)}
                    />
                </div>

                {/* Filters Row */}
                <div className="flex flex-wrap md:flex-nowrap gap-3 mt-4 items-center overflow-x-auto no-scrollbar">

                    {/* Sort Selector */}
                    <select
                        className="bg-dark-3 text-light-2 px-3 py-1 rounded-md shrink-0"
                        value={filters.sort}
                        onChange={(e) => setFilters({ ...filters, sort: e.target.value })}
                    >
                        <option value="latest">Latest</option>
                        <option value="popular">Popular</option>
                    </select>

                    {/* Location Selector */}
                    <select
                        className="bg-dark-3 text-light-2 px-3 py-1 rounded-md shrink-0 max-w-[150px] truncate"
                        value={filters.location}
                        onChange={(e) => setFilters({ ...filters, location: e.target.value })}
                    >
                        <option value="">All Locations</option>
                        {locationOptions.map((loc) => (
                            <option key={loc} value={loc}>
                                {loc.length > 18 ? loc.slice(0, 15) + "..." : loc}
                            </option>
                        ))}
                    </select>

                    {/* Tag Buttons - Horizontal Scroll */}
                    <div className="flex gap-2 overflow-x-auto no-scrollbar px-1">
                        {tagOptions.map((tag) => (
                            <button
                                key={tag}
                                onClick={() => toggleTag(tag)}
                                className={`px-3 py-1 rounded-md text-sm whitespace-nowrap border ${filters.tags.includes(tag)
                                    ? "bg-primary-500 text-white"
                                    : "bg-dark-3 text-light-2"
                                    }`}
                            >
                                #{tag}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            <div className="flex flex-wrap gap-9 w-full max-w-5xl mt-10">
                {shouldShowSearch ? (
                    isSearching ? (
                        <Loader />
                    ) : searchResults?.length ? (
                        <GridPostList posts={searchResults} />
                    ) : (
                        <p className="text-light-4 mt-10 text-center w-full">
                            No results found.
                        </p>
                    )
                ) : isFetchingPosts ? (
                    <Loader />
                ) : (
                    infinitePosts?.pages.map((group, i) => (
                        <GridPostList key={`page-${i}`} posts={group} />
                    ))
                )}
            </div>

            {hasNextPage && !shouldShowSearch && (
                <div ref={ref} className="mt-10">
                    <Loader />
                </div>
            )}
        </div>
    );
};

export default Explore;

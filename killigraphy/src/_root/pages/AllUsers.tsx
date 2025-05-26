import Loader from "@/components/shared/Loader"
import UserCard from "@/components/shared/UserCard"
import { useToast } from "@/hooks/use-toast"
import { useInfiniteUsersMutation } from "@/lib/react-query/QueriesAndMutations"

const AllUsers = () => {
    const { toast } = useToast()
    const { data: creators, isPending: isLoading, isError } = useInfiniteUsersMutation()

    if (isLoading) {
        return <div>Loading...</div>
    }

    if (isError) {
        toast({
            title: "Error",
            description: "Something went wrong while fetching users.",
            variant: "destructive",
        })
        return <div>Error fetching users</div>
    }

    return (
        <div className="common-container">
            <div className="user-container">
                <h2 className="h3-bold md:h2-bold text-left w-full">All Users</h2>
                {isLoading && !creators ? (
                    <Loader />
                ) : creators?.pages.every((page) => page.length === 0) ? (
                    <p className="text-light-4 mt-10 text-center w-full">No people found.</p>
                ) : (
                    <ul className="user-grid">
                        {creators?.pages.map((page) =>
                            page.map((user) => (
                                <li key={user._id}>
                                    <UserCard user={user} />
                                </li>
                            ))
                        )}
                    </ul>
                )}
            </div>
        </div>
    )
}

export default AllUsers
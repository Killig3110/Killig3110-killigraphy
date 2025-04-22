// Query keys for react-query is a way to identify the data being fetched or mutated.
// It is used to cache the data and also to invalidate the cache when the data is updated.
// It activiates the refetching of data when the data is stale or when the component is mounted again.

export enum QUERY_KEYS {
    // AUTH KEYS
    CREATE_USER_ACCOUNT = "createUserAccount",

    // USER KEYS
    GET_CURRENT_USER = "getCurrentUser",
    GET_USERS = "getUsers",
    GET_USER_BY_ID = "getUserById",

    // POST KEYS
    GET_POSTS = "getPosts",
    GET_INFINITE_POSTS = "getInfinitePosts",
    GET_RECENT_POSTS = "getRecentPosts",
    GET_POST_BY_ID = "getPostById",
    GET_USER_POSTS = "getUserPosts",
    GET_FILE_PREVIEW = "getFilePreview",
    GET_POST_META = "getPostMeta",

    //  SEARCH KEYS
    SEARCH_POSTS = "getSearchPosts",

    // SAVE POST KEYS
    GET_SAVED_POSTS = "getSavedPosts",

    // COMMENT KEYS
    GET_COMMENTS_BY_POST = "getCommentsByPost",

}

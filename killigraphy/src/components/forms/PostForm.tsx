import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "../ui/textarea"
import FileUpLoader from "../shared/FileUpLoader"
import { PostValidation } from "@/lib/validation"
import { useCreatePostMutation, useUpdatePostMutation } from "@/lib/react-query/QueriesAndMutations"
import { useToast } from "@/hooks/use-toast"
import { useNavigate } from "react-router-dom"
import { Post } from "@/lib/api"

type PostFormProps = {
    post?: Post;
    action: "Create" | "Update";
    prefillCaption?: string;
    prefillFile?: File;
}

const PostForm = ({ post, action, prefillCaption, prefillFile }: PostFormProps) => {
    const { mutateAsync: createPost, isPending: isLoadingCreate } = useCreatePostMutation();
    const { mutateAsync: updatePost, isPending: isLoadingUpdate } = useUpdatePostMutation();

    const { toast } = useToast();
    const navigate = useNavigate();

    const form = useForm<z.infer<typeof PostValidation>>({
        resolver: zodResolver(PostValidation),
        defaultValues: {
            caption: post ? post.caption : prefillCaption || "",
            file: post?.imageURL
                ? [new File([""], post.imageURL)]
                : prefillFile
                    ? [prefillFile]
                    : [],
            location: post ? post.location : "",
            tags: post ? post.tags.join(',') : "",
        },
    })

    // 2. Define a submit handler.
    async function onSubmit(values: z.infer<typeof PostValidation>) {
        if (post && action === "Update") {
            const isImageChanged = values.file[0] instanceof File;

            const updatedPost = await updatePost(
                {
                    postId: post._id,
                    post: {
                        caption: values.caption,
                        location: values.location,
                        tags: values.tags,
                        image: isImageChanged ? (values.file[0] as File) : undefined,
                    },
                }
            );

            if (!updatedPost) throw new Error("Update failed");
            toast({ title: "Post updated successfully" });
            return navigate(`/posts/${post._id}`);
        }

        const newPost = await createPost({
            ...values,
            image: values.file[0],
        });

        if (!newPost) {
            toast({
                title: "Error creating post",
                description: "There was an error creating your post. Please try again.",
                variant: "destructive",
            })
            return;
        }
        navigate("/home")
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-9 w-full max-w-5xl">
                <FormField
                    control={form.control}
                    name="caption"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel className="shad-form_label">Caption</FormLabel>
                            <FormControl>
                                <Textarea className="shad-textarea custom-scrollbar" {...field} />
                            </FormControl>
                            <FormMessage className="shad-form_message" />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="file"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel className="shad-form_label">Add Photos</FormLabel>
                            <FormControl>
                                <FileUpLoader
                                    fieldChange={field.onChange}
                                    mediaUrl={
                                        post?.imageURL ? post.imageURL : prefillFile ? URL.createObjectURL(prefillFile) : undefined
                                    }
                                />
                            </FormControl>
                            <FormMessage className="shad-form_message" />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="location"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel className="shad-form_label">Add Location</FormLabel>
                            <FormControl>
                                <Input type="text" className="shad-input" {...field} />
                            </FormControl>
                            <FormMessage className="shad-form_message" />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="tags"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel className="shad-form_label">Add Tags (separated by comma ", ")</FormLabel>
                            <FormControl>
                                <Input type="text" className="shad-input" placeholder="Art, Expression, Learning, etc." {...field} />
                            </FormControl>
                            <FormMessage className="shad-form_message" />
                        </FormItem>
                    )}
                />

                <div className="flex gap-4 items-center justify-end">
                    <Button type="button" className="shad-button_dark_4 h-10 w-28" onClick={() => navigate('/')}>
                        Cancel
                    </Button>
                    <Button type="submit" className="shad-button_primary whitespace-nowrap h-12 w-28"
                        disabled={isLoadingCreate || isLoadingUpdate}
                    >
                        {isLoadingCreate || isLoadingUpdate ? "Loading..." : action === "Create" ? "Create Post" : "Update Post"}
                    </Button>
                </div>
            </form>
        </Form>
    )
}

export default PostForm
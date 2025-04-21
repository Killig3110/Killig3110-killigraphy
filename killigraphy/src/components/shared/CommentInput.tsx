import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormMessage,
} from "@/components/ui/form";

import { useCreateCommentMutation } from "@/lib/react-query/QueriesAndMutations";
import { useToast } from "@/hooks/use-toast";

const commentSchema = z.object({
    content: z.string().min(1, "Không được để trống"),
});

interface Props {
    postId: string;
    parentId?: string;
    defaultValue?: string;
    inputRef?: React.RefObject<HTMLInputElement>;
}

const CommentInput = ({ postId, parentId, defaultValue = "", inputRef }: Props) => {
    const { toast } = useToast();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const createCommentMutation = useCreateCommentMutation();

    const form = useForm<z.infer<typeof commentSchema>>({
        resolver: zodResolver(commentSchema),
        defaultValues: {
            content: defaultValue,
        },
    });

    useEffect(() => {
        if (defaultValue) {
            form.setValue("content", defaultValue);
        }
    }, [defaultValue]);

    const handleSubmit = async (values: z.infer<typeof commentSchema>) => {
        setIsSubmitting(true);
        try {
            await createCommentMutation.mutateAsync({
                content: values.content,
                postId,
                parentId,
            });
            form.reset();
        } catch (err: any) {
            toast({
                title: "Lỗi bình luận",
                description:
                    err?.response?.data?.message || "Gửi bình luận thất bại, thử lại.",
                variant: "destructive",
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="flex gap-2 mt-2">
                <FormField
                    control={form.control}
                    name="content"
                    render={({ field }) => (
                        <FormItem className="flex-1">
                            <FormControl>
                                <Input
                                    {...field}
                                    ref={(el) => {
                                        field.ref(el);
                                        if (inputRef && el) inputRef.current = el;
                                    }}
                                    placeholder="Viết bình luận..."
                                    className="text-sm"
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <Button type="submit" className="shad-button_primary" size="sm" disabled={isSubmitting}>
                    Gửi
                </Button>
            </form>
        </Form>
    );
};

export default CommentInput;

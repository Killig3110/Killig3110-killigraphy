import * as z from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "react-router-dom";

import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";

import { useUserContext } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { UpdateProfileValidation } from "@/lib/validation";
import Loader from "@/components/shared/Loader";
import ProfileUploader from "@/components/shared/ProfileUploader";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useUpdateUserMutation } from "@/lib/react-query/QueriesAndMutations";
import { UpdateProfilePayload } from "@/lib/api";
import ChangePasswordDialog from "@/components/shared/ChangePasswordDialog";
import { useState } from "react";

const UpdateProfile = () => {
    const { toast } = useToast();
    const navigate = useNavigate();
    const { user, setUser } = useUserContext();
    const [avatarFile, setAvatarFile] = useState<File | null>(null);
    const [wantToPost, setWantToPost] = useState(false);

    const form = useForm<z.infer<typeof UpdateProfileValidation>>({
        resolver: zodResolver(UpdateProfileValidation),
        defaultValues: {
            file: [],
            name: user.name,
            username: user.username,
            email: user.email,
            bio: user.bio || "",
        },
    });

    const { mutateAsync: updateUser, isPending: isLoadingUpdate } = useUpdateUserMutation();

    const handleUpdate = async (value: z.infer<typeof UpdateProfileValidation>) => {
        const avatar = value.file[0];
        const payload: UpdateProfilePayload = {
            userId: user._id,
            username: value.username,
            name: value.name,
            bio: value.bio,
            file: avatar,
        };

        try {
            const updatedUser = await updateUser(payload);

            if (!updatedUser) {
                toast({
                    title: `Update failed`,
                    description: "Please try again.",
                    variant: "destructive",
                });
                return;
            }

            setUser({
                ...user,
                username: updatedUser.username,
                name: updatedUser.name,
                bio: updatedUser.bio,
                imageUrl: updatedUser.imageUrl,
            });

            toast({ title: "Update successful" });

            if (wantToPost && avatarFile) {
                console.log("Prefill file:", avatar);
                navigate("/create-post", {
                    state: {
                        prefillCaption: "New profile photo",
                        prefillFile: avatarFile,
                    },
                });
            } else {
                navigate(`/profile/${user._id}`);
            }
        } catch (err) {
            toast({
                title: "Update error",
                description: "An error occurred during update.",
                variant: "destructive",
            });
        }
    };

    return (
        <div className="flex flex-1">
            <div className="common-container">
                <div className="flex-start gap-3 justify-start w-full max-w-5xl">
                    <img
                        src="/assets/icons/edit.svg"
                        width={36}
                        height={36}
                        alt="edit"
                        className="invert-white"
                    />
                    <h2 className="h3-bold md:h2-bold text-left w-full">Edit Profile</h2>
                </div>

                <Form {...form}>
                    <form
                        onSubmit={form.handleSubmit(handleUpdate)}
                        className="flex flex-col gap-7 w-full mt-4 max-w-5xl"
                    >
                        <FormField
                            control={form.control}
                            name="file"
                            render={({ field }) => (
                                <FormItem className="flex">
                                    <FormControl>
                                        <ProfileUploader
                                            fieldChange={field.onChange}
                                            mediaUrl={user.imageUrl}
                                            onAvatarConfirmed={(file) => {
                                                setAvatarFile(file);
                                                setWantToPost(true); // Gợi ý người dùng tạo post
                                            }}
                                        />
                                    </FormControl>
                                    <FormMessage className="shad-form_message" />
                                </FormItem>
                            )}
                        />
                        {
                            wantToPost && (
                                <div className="flex items-center gap-2">
                                    <input
                                        type="checkbox"
                                        checked={wantToPost}
                                        onChange={(e) => setWantToPost(e.target.checked)}
                                    />
                                    <label className="text-sm">Creat a post with new profile photo</label>
                                </div>
                            )
                        }

                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="shad-form_label">Name</FormLabel>
                                    <FormControl>
                                        <Input type="text" className="shad-input" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="username"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="shad-form_label">Username</FormLabel>
                                    <FormControl>
                                        <Input
                                            type="text"
                                            className="shad-input"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="flex items-center gap-4">
                            <FormField
                                control={form.control}
                                name="email"
                                render={({ field }) => (
                                    <FormItem className="flex-1">
                                        <FormLabel className="shad-form_label">Email</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="text"
                                                className="shad-input"
                                                {...field}
                                                disabled
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <div className="mt-6">
                                <ChangePasswordDialog />
                            </div>
                        </div>

                        <FormField
                            control={form.control}
                            name="bio"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="shad-form_label">Bio</FormLabel>
                                    <FormControl>
                                        <Textarea
                                            className="shad-textarea custom-scrollbar"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage className="shad-form_message" />
                                </FormItem>
                            )}
                        />

                        <div className="flex gap-4 items-center justify-end">
                            <Button
                                type="button"
                                className="shad-button_dark_4"
                                onClick={() => navigate(-1)}
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                className="shad-button_primary whitespace-nowrap"
                                disabled={isLoadingUpdate}
                            >
                                {isLoadingUpdate && <Loader />}
                                Update Profile
                            </Button>
                        </div>
                    </form>
                </Form>
            </div>
        </div>
    );
};

export default UpdateProfile;

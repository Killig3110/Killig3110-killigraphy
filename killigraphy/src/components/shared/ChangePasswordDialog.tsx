import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
    Form,
    FormField,
    FormItem,
    FormLabel,
    FormControl,
    FormMessage,
} from "@/components/ui/form";
import {
    useChangePasswordMutation,
    useRequestOtpMutation,
    useVerifyOtpMutation,
} from "@/lib/react-query/QueriesAndMutations";
import { useUserContext } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useEffect, useState } from "react";

const changePasswordSchema = z
    .object({
        email: z.string().email(),
        otp: z.string().length(6, "OTP must be 6 digits"),
        oldPassword: z.string().min(6, "Old password is required"),
        newPassword: z.string().min(6, "New password must be at least 6 characters"),
        confirmPassword: z.string(),
    })
    .refine((data) => data.newPassword === data.confirmPassword, {
        message: "Passwords do not match",
        path: ["confirmPassword"],
    });

type ChangePasswordValues = z.infer<typeof changePasswordSchema>;

const ChangePasswordDialog = () => {
    const { user } = useUserContext();
    const { toast } = useToast();
    const { mutateAsync: changePassword, isPending } = useChangePasswordMutation();
    const { mutateAsync: requestOtp, isPending: isSendingOtp } = useRequestOtpMutation();
    const { mutateAsync: verifyOtp, isPending: isVerifyingOtp } = useVerifyOtpMutation();

    const [isOtpSent, setIsOtpSent] = useState(false);
    const [isOtpVerified, setIsOtpVerified] = useState(false);
    const [countdown, setCountdown] = useState(0);

    const form = useForm<ChangePasswordValues>({
        resolver: zodResolver(changePasswordSchema),
        defaultValues: {
            email: user.email,
            otp: "",
            oldPassword: "",
            newPassword: "",
            confirmPassword: "",
        },
    });

    const handleSendOtp = async () => {
        try {
            await requestOtp({ email: user.email });
            toast({ title: "OTP sent. Check your email" });
            setIsOtpSent(true);
            setCountdown(60);
        } catch (err: any) {
            toast({
                title: "Failed to send OTP",
                description: err?.response?.data?.message || "Please try again",
                variant: "destructive",
            });
        }
    };

    useEffect(() => {
        if (countdown > 0) {
            const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
            return () => clearTimeout(timer);
        }
    }, [countdown]);

    const handleVerifyOtp = async () => {
        const { email, otp } = form.getValues();
        try {
            const res = await verifyOtp({ email, otp }) as { verified: boolean };
            if (res.verified) {
                toast({ title: "OTP verified" });
                setIsOtpVerified(true);
            } else {
                toast({ title: "Incorrect OTP", variant: "destructive" });
            }
        } catch (err: any) {
            toast({
                title: "Verification failed",
                description: err?.response?.data?.message || "Invalid OTP",
                variant: "destructive",
            });
        }
    };

    const onSubmit = async (values: ChangePasswordValues) => {
        try {
            await changePassword({
                userId: user._id,
                oldPassword: values.oldPassword,
                newPassword: values.newPassword,
            });
            toast({ title: "Password updated successfully" });
            form.reset();
        } catch (error: any) {
            toast({
                title: "Failed to update password",
                description: error?.response?.data?.message || "Something went wrong.",
                variant: "destructive",
            });
        }
    };

    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="ml-2">
                    Change Password
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Change Password</DialogTitle>
                    <DialogDescription>
                        Verify OTP then update your password.
                    </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4 py-4">
                        {/* Email + Send OTP */}
                        <div className="flex items-end gap-2">
                            <FormField
                                control={form.control}
                                name="email"
                                render={({ field }) => (
                                    <FormItem className="flex-1">
                                        <FormLabel>Email</FormLabel>
                                        <FormControl>
                                            <Input {...field} disabled />
                                        </FormControl>
                                    </FormItem>
                                )}
                            />
                            <div className="pt-[1.625rem]">
                                <Button
                                    type="button"
                                    variant="secondary"
                                    className={`${isSendingOtp ? "shad-button_primary" : "shad-button_primary_ghost"}`}
                                    onClick={handleSendOtp}
                                    disabled={isSendingOtp || countdown > 0}
                                >
                                    {isSendingOtp ? "Sending..." : countdown > 0 ? `Resend (${countdown})` : "Send OTP"}
                                </Button>
                            </div>
                        </div>

                        {/* OTP + Verify */}
                        {isOtpSent && (
                            <div className="flex items-center gap-2">
                                <FormField
                                    control={form.control}
                                    name="otp"
                                    render={({ field }) => (
                                        <FormItem className="flex-1">
                                            <FormLabel>OTP</FormLabel>
                                            <FormControl>
                                                <Input {...field} maxLength={6} disabled={isOtpVerified} />
                                            </FormControl>
                                        </FormItem>
                                    )}
                                />
                                < div className="pt-[1.625rem]">
                                    <Button
                                        type="button"
                                        variant="secondary"
                                        className={`${isVerifyingOtp ? "shad-button_primary" : "shad-button_primary_ghost"}`}
                                        onClick={handleVerifyOtp}
                                        disabled={isVerifyingOtp || isOtpVerified}
                                    >
                                        {isVerifyingOtp ? "Verifying..." : "Verify"}
                                    </Button>
                                </div>
                            </div>
                        )}

                        {/* Password Fields (only show when verified) */}
                        {isOtpVerified && (
                            <>
                                <FormField
                                    control={form.control}
                                    name="oldPassword"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Old Password</FormLabel>
                                            <FormControl>
                                                <Input type="password" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="newPassword"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>New Password</FormLabel>
                                            <FormControl>
                                                <Input type="password" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="confirmPassword"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Confirm Password</FormLabel>
                                            <FormControl>
                                                <Input type="password" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </>
                        )}

                        <DialogFooter>
                            <Button type="submit" disabled={!isOtpVerified || isPending}>
                                {isPending ? "Updating..." : "Save changes"}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog >
    );
};

export default ChangePasswordDialog;

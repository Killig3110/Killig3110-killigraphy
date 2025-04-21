import * as z from "zod";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { zodResolver } from "@hookform/resolvers/zod";

import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Loader from "@/components/shared/Loader";

import { SignupValidation } from "@/lib/validation";
import { useUserContext } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useCreateUserAccountMutation, useRequestOtpMutation, useVerifyOtpMutation } from "@/lib/react-query/QueriesAndMutations";
import { useEffect, useState } from "react";

const SignupForm = () => {
    const { toast } = useToast();
    const navigate = useNavigate();
    const { checkAuthUser, isLoading: isUserLoading } = useUserContext();

    const [otp, setOtp] = useState('');
    const [isOtpSent, setIsOtpSent] = useState(false);
    const [isOtpVerified] = useState(false);
    const [resendCountdown, setResendCountdown] = useState(0);

    const form = useForm<z.infer<typeof SignupValidation>>({
        resolver: zodResolver(SignupValidation),
        defaultValues: {
            name: "",
            username: "",
            email: "",
            password: "",
        },
    });

    // Queries
    const { mutateAsync: createUserAccount, isPending: isCreatingAccount } = useCreateUserAccountMutation();
    const { mutateAsync: requestOtp, isPending: isSendingOtp } = useRequestOtpMutation();
    const { mutateAsync: verifyOtp } = useVerifyOtpMutation();

    const handleSendOtp = async () => {
        const email = form.getValues("email");

        if (!email) {
            toast({ title: "Email & Password required", variant: "destructive" });
            return;
        }

        try {
            await requestOtp({ email });

            toast({ title: "OTP sent", description: "Please check your email" });
            setIsOtpSent(true);
            setResendCountdown(30); // 30s cooldown
        } catch (error: any) {
            toast({
                title: "Failed to send OTP",
                description: error?.response?.data?.message || "Try again later",
                variant: "destructive",
            });
        }
    };

    useEffect(() => {
        if (resendCountdown <= 0) return;

        const timer = setTimeout(() => {
            setResendCountdown((prev) => prev - 1);
        }, 1000);

        return () => clearTimeout(timer);
    }, [resendCountdown]);

    // Handler
    const handleSignup = async (user: z.infer<typeof SignupValidation>) => {
        try {
            const email = form.getValues("email");

            const res = await verifyOtp({ email, otp }) as { verified: boolean };

            if (!res.verified) {
                toast({ title: "Invalid OTP", variant: "destructive" });
                return;
            }

            await createUserAccount(user);

            const isLoggedIn = await checkAuthUser();
            if (isLoggedIn) {
                form.reset();
                navigate("/home");
            } else {
                toast({ title: "Login failed. Please try again." });
                navigate("/sign-in");
            }
        } catch (error: any) {
            const message =
                error?.response?.data?.message ||
                error?.message ||
                "Sign up failed. Please try again.";

            toast({
                title: "Sign up error",
                description: message,
                variant: "destructive",
            });
        }
    };

    return (
        <Form {...form}>
            <div className="sm:w-420 flex-center flex-col">
                <img src="/assets/images/lo_go_remove_bg.png" alt="logo" />

                <h2 className="h3-bold md:h2-bold pt-5 sm:pt-12">
                    Create a new account
                </h2>
                <p className="text-light-3 small-medium md:base-regular mt-2">
                    To use snapgram, Please enter your details
                </p>

                <form
                    onSubmit={form.handleSubmit(handleSignup)}
                    className="flex flex-col gap-5 w-full mt-4">
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
                                    <Input type="text" className="shad-input" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel className="shad-form_label">Email</FormLabel>
                                <FormControl>
                                    <Input type="text" className="shad-input" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="password"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel className="shad-form_label">Password</FormLabel>
                                <FormControl>
                                    <Input type="password" className="shad-input" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    {/* OTP Input + Button */}
                    {isOtpSent && (
                        <div className="flex flex-row gap-2" >
                            <Input
                                placeholder="Enter 6-digit OTP"
                                value={otp}
                                onChange={(e) => setOtp(e.target.value)}
                                maxLength={6}
                                className="tracking-widest text-center"
                                disabled={isOtpVerified}
                            />

                            <Button
                                type="button"
                                variant="secondary"
                                className={
                                    `text-sm px-3 py-1 border rounded-md font-medium
                                    ${resendCountdown > 0 ? "shad-button_primary_ghost" : "shad-button_primary"}
                                    `}
                                onClick={handleSendOtp}
                                disabled={resendCountdown > 0}
                            >
                                {resendCountdown > 0 ? `Send Again (${resendCountdown})` : "Send Again"}
                            </Button>


                        </div>
                    )}

                    {/* Gửi mã OTP hoặc Đăng nhập */}
                    {!isOtpSent ? (
                        <Button type="button" className="shad-button_primary" onClick={() => handleSendOtp()} disabled={isSendingOtp || isCreatingAccount}>
                            {isSendingOtp ? <Loader /> : "Send OTP"}
                        </Button>
                    ) : (
                        <Button
                            type="submit"
                            className="shad-button_primary"
                            disabled={isCreatingAccount || isUserLoading}
                        >
                            {isCreatingAccount || isUserLoading ? <Loader /> : "Verify OTP & Sign Up"}
                        </Button>
                    )}

                    <p className="text-small-regular text-light-2 text-center mt-2">
                        Already have an account?
                        <Link
                            to="/sign-in"
                            className="text-primary-500 text-small-semibold ml-1">
                            Log in
                        </Link>
                    </p>
                </form>
            </div>
        </Form>
    );
};

export default SignupForm;
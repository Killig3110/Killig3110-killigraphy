import * as z from "zod";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { zodResolver } from "@hookform/resolvers/zod";

import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Loader from "@/components/shared/Loader";

import { SigninValidation } from "@/lib/validation";
import { useUserContext } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { getCurrentUser } from "@/lib/Appwrite/api";
import { useSignInAccountMutation } from "@/lib/react-query/QueriesAndMutations";

function SigninForm() {
    const { toast } = useToast();
    const navigate = useNavigate();
    const { checkAuthUser, isLoading: isUserLoading } = useUserContext();

    const form = useForm<z.infer<typeof SigninValidation>>({
        resolver: zodResolver(SigninValidation),
        defaultValues: {
            email: "",
            password: "",
        },
    });

    const {
        mutateAsync: signInAccount,
        isPending: isSigningInUser,
    } = useSignInAccountMutation();

    const handleSignup = async (user: z.infer<typeof SigninValidation>) => {
        try {
            const session = await signInAccount({
                email: user.email,
                password: user.password,
            });

            if (!session) {
                toast({
                    title: "Login failed",
                    description: "No session created. Please try again.",
                    variant: "destructive",
                });
                return;
            }

            const newUser = await getCurrentUser();

            if (!newUser) {
                toast({
                    title: "Login failed",
                    description: "Unable to fetch user after login.",
                    variant: "destructive",
                });
                return;
            }

            const isLoggedIn = await checkAuthUser();

            if (isLoggedIn) {
                form.reset();
                navigate("/");
            } else {
                toast({
                    title: "Login failed",
                    description: "Authentication failed after login.",
                    variant: "destructive",
                });
                navigate("/sign-in");
            }
        } catch (error: any) {
            const message =
                error?.response?.message ||
                error?.message ||
                "Error signing in. Please try again.";

            toast({
                title: "Sign in error",
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
                    Log in to your account
                </h2>
                <p className="text-light-3 small-medium md:base-regular mt-2">
                    Welcome back! Please enter your details.
                </p>

                <form
                    onSubmit={form.handleSubmit(handleSignup)}
                    className="flex flex-col gap-5 w-full mt-4"
                >
                    <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel className="shad-form_label">Email</FormLabel>
                                <FormControl>
                                    <Input type="email" className="shad-input" {...field} />
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

                    <Button
                        type="submit"
                        className="shad-button_primary"
                        disabled={isSigningInUser || isUserLoading}
                    >
                        {isSigningInUser || isUserLoading ? (
                            <div className="flex-center gap-2">
                                <Loader /> Signing in...
                            </div>
                        ) : (
                            "Sign In"
                        )}
                    </Button>

                    <p className="text-small-regular text-light-2 text-center mt-2">
                        Don't have an account?
                        <Link
                            to="/sign-up"
                            className="text-primary-500 text-small-semibold ml-1"
                        >
                            Sign Up
                        </Link>
                    </p>
                </form>
            </div>
        </Form>
    );
}

export default SigninForm;

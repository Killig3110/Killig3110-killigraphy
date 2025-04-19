import { Outlet, Navigate } from "react-router-dom";

const AuthLayout = () => {
    const isAuthenticated = false; // Replace with actual authentication logic
    return (
        <>
            {isAuthenticated ? (
                <Navigate to="" />
            ) : (
                <>
                    <section className="flex flex-1 flex-col items-center justify-center">
                        <Outlet /> {/* This will render the child routes (SigninForm, SignupForm) */}
                    </section>
                    <img
                        src="/assets/images/side-img.svg"
                        alt="Logo"
                        className="hidden xl:block h-screen w-1/2 object-cover bg-no-repeat"
                    />

                </>
            )}
        </>
    );
}

export default AuthLayout;
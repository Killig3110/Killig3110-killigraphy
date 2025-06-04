import { Outlet, Navigate } from "react-router-dom";

const AuthLayout = () => {
    const isAuthenticated = false; // Replace with actual authentication logic
    return (
        <>
            {isAuthenticated ? (
                <Navigate to="" />
            ) : (
                <div className="flex h-screen">
                    {/* Left: Form Section */}
                    <section className="flex flex-1 flex-col items-center justify-center bg-black relative z-10">
                        <Outlet />
                    </section>

                    {/* Right: Background Section */}
                    <div className="hidden xl:block relative w-1/2 h-full">
                        <img
                            src="/assets/images/sidebar.jpg"
                            alt="Background"
                            className="h-full w-full object-cover"
                        />
                        {/* Gradient Blend */}
                        <div className="absolute inset-0 bg-gradient-to-l from-transparent to-black/80" />
                        {/* Optional: thêm lớp mờ nhẹ trên ảnh */}
                        <div className="absolute inset-0 bg-black/30" />
                    </div>
                </div>
            )}
        </>
    );
};

export default AuthLayout;

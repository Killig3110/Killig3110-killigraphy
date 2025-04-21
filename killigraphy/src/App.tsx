import { Routes, Route, Navigate } from 'react-router-dom';

import AuthLayout from './_auth/AuthLayout';
import SigninForm from './_auth/forms/SigninForm';
import SignupForm from './_auth/forms/SignupForm';

import {
    AllUsers,
    CreatePost,
    EditPost,
    Explore,
    Home,
    PostDetails,
    Profile,
    Saved,
    UpdateProfile
} from './_root/pages';

import './globals.css';
import RootLayout from './_root/RootLayout';
import { Toaster } from './components/ui/toaster';
import { useUserContext } from './context/AuthContext';
import Loader from "@/components/shared/Loader";

const App = () => {
    const { isAuthenticated, isLoading } = useUserContext();

    if (isLoading) return <div className="w-full h-full flex-center"><Loader /></div>;
    return (
        <main className="flex h-screen">
            <Routes>
                {/* Redirect root to sign-in */}
                <Route
                    path="/"
                    element={
                        isAuthenticated ? (
                            <Navigate to="/home" replace />
                        ) : (
                            <Navigate to="/sign-in" replace />
                        )
                    }
                />

                {/* Public routes */}
                <Route element={<AuthLayout />}>
                    <Route path="/sign-in" element={<SigninForm />} />
                    <Route path="/sign-up" element={<SignupForm />} />
                </Route>

                {/* Private routes */}
                <Route element={<RootLayout />}>
                    <Route path="/home" element={<Home />} />
                    <Route path="/explore" element={<Explore />} />
                    <Route path="/saved" element={<Saved />} />
                    <Route path="/all-users" element={<AllUsers />} />
                    <Route path="/create-post" element={<CreatePost />} />
                    <Route path="/update-post/:postId" element={<EditPost />} />
                    <Route path="/posts/:id" element={<PostDetails />} />
                    <Route path="/profile/:id" element={<Profile />} />
                    <Route path="/update-profile/:id" element={<UpdateProfile />} />
                </Route>
            </Routes>

            <Toaster />
        </main>
    );
};

export default App;

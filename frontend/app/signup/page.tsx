"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabase";

export default function SignupPage() {
    const router = useRouter();

    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    async function handleSignup(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();

        const { data: existingProfile } = await supabase
            .from('profiles')
            .select('email')
            .eq('email', email)
            .maybeSingle();

        if (existingProfile) {
            alert('This email already has an account. Please login or reset your password.');
            router.push('/login');
            return;
        }

        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    username,
                },
            },
        });

        if (error) {
            if (error.message.toLowerCase().includes('already registered')) {
                alert('This email already has an account. Please login or reset your password.');
                router.push('/login');
                return;
            }

            alert(error.message);
            return;
        }

        if (data.user) {
            await supabase.from("profiles").insert({
                id: data.user.id,
                email: data.user.email,
                username: username,
                role: "user",
            });
        }

        if (data.session) {
            router.push("/dashboard");
        } else {
            alert("Check your email to confirm account");
            router.push("/login");
        }
    }

    return (
        <section className="flex min-h-[70vh] items-center justify-center px-6 py-12 bg-gray-50">
            <div className="w-full max-w-md rounded-xl border bg-white p-6 shadow-sm">
                <h1 className="mb-2 text-2xl font-bold">Create Account</h1>
                <p className="mb-6 text-sm text-gray-500">
                    Sign up to access your Compliance Portal
                </p>

                <form onSubmit={handleSignup} className="space-y-4">
                    <div>
                        <label className="mb-1 block text-sm font-medium">Full Name</label>
                        <input
                            type="text"
                            placeholder="John Doe"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                            className="w-full rounded border px-3 py-2"
                        />
                    </div>

                    <div>
                        <label className="mb-1 block text-sm font-medium">Email</label>
                        <input
                            type="email"
                            placeholder="you@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className="w-full rounded border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-black"
                        />
                    </div>

                    <div>
                        <label className="mb-1 block text-sm font-medium">Password</label>
                        <input
                            type="password"
                            placeholder="Create password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            className="w-full rounded border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-black"
                        />
                    </div>

                    <button
                        type="submit"
                        className="w-full rounded bg-black py-2 text-white hover:opacity-80 transition"
                    >
                        Create Account
                    </button>
                </form>

                <p className="mt-4 text-sm text-gray-600 text-center">
                    Already have an account?{" "}
                    <button
                        type="button"
                        onClick={() => router.push("/login")}
                        className="text-blue-600 hover:underline"
                    >
                        Login
                    </button>
                </p>
            </div>
        </section>
    );
}
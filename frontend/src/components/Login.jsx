import { useState } from "react";
import { motion } from "framer-motion";
import FloatingIcons from "./FloatingIcons";
import { toast } from "react-toastify";

const API_BASE = "http://127.0.0.1:8000/api";

function Login({ setIsLoggedIn, onForgotPassword }) {
    const [isRegister, setIsRegister] = useState(false);
    const [confirmPassword, setConfirmPassword] = useState("");
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);

    // =========================
    // LOGIN
    // =========================

    const handleLogin = async () => {
        if (!username.trim() || !password) {
            toast.warning("Please enter username and password.");
            return;
        }

        setLoading(true);

        try {
            const response = await fetch(`${API_BASE}/login/`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    username: username.trim(),
                    password,
                }),
            });

            const data = await response.json();

            if (
                response.ok &&
                data.access &&
                data.refresh
            ) {
                // Store tokens only after successful authentication.
                localStorage.setItem("access", data.access);
                localStorage.setItem("refresh", data.refresh);

                toast.success("Login successful!");

                // Tell App.jsx to display the dashboard.
                setIsLoggedIn(true);
            } else {
                toast.error(
                    data.detail ||
                    "Invalid username or password."
                );
            }
        } catch (error) {
            console.error("Login error:", error);
            toast.error("Unable to connect to the server.");
        } finally {
            setLoading(false);
        }
    };

    // =========================
    // REGISTER
    // =========================

    const handleRegister = async () => {
        if (
            !username.trim() ||
            !email.trim() ||
            !password ||
            !confirmPassword
        ) {
            toast.warning("Please fill all fields.");
            return;
        }

        if (password !== confirmPassword) {
            toast.warning("Passwords do not match.");
            return;
        }

        setLoading(true);

        try {
            const response = await fetch(`${API_BASE}/register/`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    username: username.trim(),
                    email: email.trim(),
                    password,
                }),
            });

            const data = await response.json();

            if (response.ok) {
                toast.success(
                    "Account created! Check your email to verify your account."
                );

                // Return to login after successful registration.
                setIsRegister(false);
                setUsername("");
                setEmail("");
                setPassword("");
                setConfirmPassword("");
            } else {
                if (data.username) {
                    toast.error(data.username[0]);
                } else if (data.email) {
                    toast.error(data.email[0]);
                } else if (data.password) {
                    toast.error(data.password[0]);
                } else if (data.detail) {
                    toast.error(data.detail);
                } else {
                    toast.error("Registration failed.");
                }
            }
        } catch (error) {
            console.error("Registration error:", error);
            toast.error("Unable to connect to the server.");
        } finally {
            setLoading(false);
        }
    };

    // =========================
    // FORM SUBMISSION
    // =========================

    const handleSubmit = (event) => {
        event.preventDefault();

        if (loading) {
            return;
        }

        if (isRegister) {
            handleRegister();
        } else {
            handleLogin();
        }
    };

    // =========================
    // UI
    // =========================

    return (
        <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-zinc-950 via-purple-950 to-black flex items-center justify-center px-4 py-8">

            <FloatingIcons />

            <div className="absolute w-96 h-96 bg-purple-600/20 blur-[140px] rounded-full top-10 left-10"></div>

            <div className="absolute w-96 h-96 bg-blue-600/20 blur-[140px] rounded-full bottom-10 right-10"></div>

            <motion.div
                initial={{
                    opacity: 0,
                    scale: 0.9,
                    y: 40,
                }}
                animate={{
                    opacity: 1,
                    scale: 1,
                    y: 0,
                }}
                transition={{
                    duration: 0.6,
                }}
                className="relative z-10 w-full max-w-[420px] rounded-[35px] border border-white/10 bg-white/10 backdrop-blur-2xl shadow-2xl shadow-purple-500/40 p-8 sm:p-10"
            >
                <h1 className="text-4xl sm:text-5xl font-extrabold text-white mb-3">
                    {isRegister ? "Create Account" : "Welcome"}
                </h1>

                <p className="text-zinc-300 mb-8">
                    {isRegister
                        ? "Create your Personal Hub account"
                        : "Sign in to your Personal Hub"}
                </p>

                <form onSubmit={handleSubmit}>
                    <input
                        type="text"
                        placeholder="Username"
                        value={username}
                        onChange={(event) =>
                            setUsername(event.target.value)
                        }
                        autoComplete="username"
                        required
                        disabled={loading}
                        className="w-full bg-black/30 border border-white/10 rounded-2xl px-5 py-4 text-white outline-none focus:border-purple-500 transition-all mb-4"
                    />

                    {isRegister && (
                        <input
                            type="email"
                            placeholder="Email"
                            value={email}
                            onChange={(event) =>
                                setEmail(event.target.value)
                            }
                            autoComplete="email"
                            required
                            disabled={loading}
                            className="w-full bg-black/30 border border-white/10 rounded-2xl px-5 py-4 text-white outline-none focus:border-purple-500 transition-all mb-4"
                        />
                    )}

                    <input
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={(event) =>
                            setPassword(event.target.value)
                        }
                        autoComplete={
                            isRegister
                                ? "new-password"
                                : "current-password"
                        }
                        required
                        disabled={loading}
                        className="w-full bg-black/30 border border-white/10 rounded-2xl px-5 py-4 text-white outline-none focus:border-purple-500 transition-all mb-4"
                    />

                    {!isRegister && (
                        <div className="flex justify-end mb-5">
                            <button
                                type="button"
                                onClick={onForgotPassword}
                                disabled={loading}
                                className="text-sm text-purple-300 hover:text-white transition-colors"
                            >
                                Forgot Password?
                            </button>
                        </div>
                    )}

                    {isRegister && (
                        <input
                            type="password"
                            placeholder="Confirm Password"
                            value={confirmPassword}
                            onChange={(event) =>
                                setConfirmPassword(event.target.value)
                            }
                            autoComplete="new-password"
                            required
                            disabled={loading}
                            className="w-full bg-black/30 border border-white/10 rounded-2xl px-5 py-4 text-white outline-none focus:border-purple-500 transition-all mb-6"
                        />
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className={`w-full mt-2 py-4 rounded-2xl font-bold text-white transition-all duration-300 shadow-lg ${
                            loading
                                ? "bg-gray-600 cursor-not-allowed"
                                : "bg-gradient-to-r from-purple-600 to-blue-600 hover:scale-[1.02] shadow-purple-500/30 hover:shadow-purple-500/50 active:scale-95"
                        }`}
                    >
                        {loading
                            ? isRegister
                                ? "Creating Account..."
                                : "Logging In..."
                            : isRegister
                                ? "Create Account"
                                : "Login"}
                    </button>
                </form>

                <div className="text-center mt-6">
                    {isRegister ? (
                        <p className="text-zinc-400">
                            Already have an account?

                            <button
                                type="button"
                                onClick={() => {
                                    if (!loading) {
                                        setIsRegister(false);
                                    }
                                }}
                                disabled={loading}
                                className="ml-2 text-purple-400 hover:text-purple-300"
                            >
                                Login
                            </button>
                        </p>
                    ) : (
                        <p className="text-zinc-400">
                            Don't have an account?

                            <button
                                type="button"
                                onClick={() => {
                                    if (!loading) {
                                        setIsRegister(true);
                                    }
                                }}
                                disabled={loading}
                                className="ml-2 text-purple-400 hover:text-purple-300"
                            >
                                Create Account
                            </button>
                        </p>
                    )}
                </div>
            </motion.div>
        </div>
    );
}

export default Login;
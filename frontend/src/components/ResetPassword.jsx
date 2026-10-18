import { useState } from "react";
import { toast } from "react-toastify";

function ResetPassword({ uid, token, onBackToLogin }) {
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    const handleResetPassword = async (e) => {
        e.preventDefault();

        if (password.length < 6) {
            toast.warning("Password must be at least 6 characters.");
            return;
        }

        if (password !== confirmPassword) {
            toast.warning("Passwords do not match.");
            return;
        }

        setLoading(true);

        try {
            const response = await fetch(
                `https://personalhub-backend-ptlj.onrender.com/api/reset-password/${uid}/${token}/`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        password,
                    }),
                }
            );

            const data = await response.json();

            if (response.ok) {
                setSuccess(true);
                setPassword("");
                setConfirmPassword("");

                toast.success("Password reset successfully!");
            } else {
                toast.error(
                    data.detail || "Unable to reset password."
                );
            }
        } catch (error) {
            console.error(error);
            toast.error("Unable to connect to the server.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-purple-950 to-black flex items-center justify-center px-4">

            <div className="w-full max-w-md rounded-3xl border border-white/10 bg-white/10 p-8 shadow-2xl backdrop-blur-xl">

                {!success ? (
                    <>
                        <h1 className="mb-3 text-3xl font-bold text-white">
                            Reset Password 🔐
                        </h1>

                        <p className="mb-6 text-sm text-zinc-400">
                            Create a new password for your PersonalHub account.
                        </p>

                        <form onSubmit={handleResetPassword}>
                            <label className="mb-2 block text-sm text-zinc-300">
                                New Password
                            </label>

                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Enter new password"
                                autoComplete="new-password"
                                minLength={6}
                                required
                                className="mb-5 w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-white outline-none focus:border-purple-500"
                            />

                            <label className="mb-2 block text-sm text-zinc-300">
                                Confirm Password
                            </label>

                            <input
                                type="password"
                                value={confirmPassword}
                                onChange={(e) =>
                                    setConfirmPassword(e.target.value)
                                }
                                placeholder="Confirm new password"
                                autoComplete="new-password"
                                minLength={6}
                                required
                                className="mb-6 w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-white outline-none focus:border-purple-500"
                            />

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 py-3 font-bold text-white transition hover:opacity-90 disabled:opacity-50"
                            >
                                {loading
                                    ? "Resetting Password..."
                                    : "Reset Password"}
                            </button>
                        </form>
                    </>
                ) : (
                    <>
                        <h1 className="mb-3 text-3xl font-bold text-white">
                            Password Reset! 🎉
                        </h1>

                        <p className="mb-6 text-sm leading-6 text-zinc-300">
                            Your password has been changed successfully.
                            You can now log in using your new password.
                        </p>

                        <button
                            onClick={onBackToLogin}
                            className="w-full rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 py-3 font-bold text-white"
                        >
                            Back to Login
                        </button>
                    </>
                )}

            </div>
        </div>
    );
}

export default ResetPassword;
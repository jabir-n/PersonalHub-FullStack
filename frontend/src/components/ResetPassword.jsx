import { useState } from "react";
import { toast } from "react-toastify";

const API_BASE = "https://personalhub-backend-ptlj.onrender.com/api";

function ResetPassword({ uid, token, onBackToLogin }) {
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");

    const handleResetPassword = async (e) => {
        e.preventDefault();

        if (loading) return;

        setErrorMessage("");

        if (password.length < 6) {
            setErrorMessage(
                "Password must be at least 6 characters."
            );
            toast.warning("Password must be at least 6 characters.");
            return;
        }

        if (password !== confirmPassword) {
            setErrorMessage("Passwords do not match.");
            toast.warning("Passwords do not match.");
            return;
        }

        setLoading(true);

        try {
            const response = await fetch(
                `${API_BASE}/reset-password/${encodeURIComponent(uid)}/${encodeURIComponent(token)}/`,
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

            const responseText = await response.text();

            let data = {};

            try {
                data = responseText ? JSON.parse(responseText) : {};
            } catch {
                data = {};
            }

            if (!response.ok) {
                let message = "Unable to reset password. Please try again.";

                if (Array.isArray(data.detail)) {
                    message = data.detail.join(" ");
                } else if (typeof data.detail === "string") {
                    message = data.detail;
                } else if (typeof data === "string" && data) {
                    message = data;
                }

                setErrorMessage(message);
                toast.error(message);
                return;
            }

            setSuccess(true);
            setPassword("");
            setConfirmPassword("");
            setErrorMessage("");

            toast.success("Password reset successfully!");
        } catch (error) {
            console.error("Password reset error:", error);

            const message =
                "Unable to connect to the server. Please try again.";

            setErrorMessage(message);
            toast.error(message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-purple-950 to-black flex items-center justify-center px-4 py-8">
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
                            <label
                                htmlFor="new-password"
                                className="mb-2 block text-sm text-zinc-300"
                            >
                                New Password
                            </label>

                            <input
                                id="new-password"
                                type="password"
                                value={password}
                                onChange={(e) => {
                                    setPassword(e.target.value);
                                    setErrorMessage("");
                                }}
                                placeholder="Enter new password"
                                autoComplete="new-password"
                                minLength={6}
                                required
                                disabled={loading}
                                className="mb-5 w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-white outline-none focus:border-purple-500 disabled:opacity-50"
                            />

                            <label
                                htmlFor="confirm-password"
                                className="mb-2 block text-sm text-zinc-300"
                            >
                                Confirm Password
                            </label>

                            <input
                                id="confirm-password"
                                type="password"
                                value={confirmPassword}
                                onChange={(e) => {
                                    setConfirmPassword(e.target.value);
                                    setErrorMessage("");
                                }}
                                placeholder="Confirm new password"
                                autoComplete="new-password"
                                minLength={6}
                                required
                                disabled={loading}
                                className="mb-4 w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-white outline-none focus:border-purple-500 disabled:opacity-50"
                            />

                            <p className="mb-5 text-xs leading-5 text-zinc-400">
                                Choose a password that meets the security
                                requirements. Passwords containing only numbers
                                or commonly used passwords may be rejected.
                            </p>

                            {errorMessage && (
                                <div
                                    role="alert"
                                    className="mb-5 rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-sm leading-6 text-red-300 break-words"
                                >
                                    {errorMessage}
                                </div>
                            )}

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 py-3 font-bold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
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
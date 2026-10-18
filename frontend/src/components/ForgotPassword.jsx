import { useState } from "react"
import { toast } from "react-toastify"

function ForgotPassword({ onBackToLogin }) {

  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!email.trim()) {
      toast.warning("Please enter your email address.")
      return
    }

    setLoading(true)

    try {
      const response = await fetch(
        "https://personalhub-backend-ptlj.onrender.com/api/forgot-password/",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: email.trim(),
          }),
        }
      )

      const data = await response.json()

      if (!response.ok) {
        toast.error(data.detail || "Something went wrong.")
        return
      }

      setSubmitted(true)

    } catch (error) {
      console.error(error)
      toast.error("Unable to connect to the server.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-purple-950 to-black flex items-center justify-center px-4">

      <div className="w-full max-w-md rounded-3xl border border-white/10 bg-white/10 p-8 shadow-2xl backdrop-blur-xl">

        {!submitted ? (
          <>
            <h1 className="mb-2 text-3xl font-bold text-white">
              Forgot Password?
            </h1>

            <p className="mb-6 text-sm text-zinc-400">
              Enter your registered email address and we'll send you a password-reset link.
            </p>

            <form onSubmit={handleSubmit}>

              <label className="mb-2 block text-sm text-zinc-300">
                Email Address
              </label>

              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                autoComplete="email"
                required
                className="mb-5 w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-white outline-none focus:border-purple-500"
              />

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 py-3 font-bold text-white transition hover:opacity-90 disabled:opacity-50"
              >
                {loading ? "Sending..." : "Send Reset Link"}
              </button>

            </form>
          </>
        ) : (
          <>
            <h1 className="mb-3 text-3xl font-bold text-white">
              Check Your Email 📩
            </h1>

            <p className="mb-6 text-sm leading-6 text-zinc-300">
              If an account exists with that email address, a password-reset link has been sent. Check your inbox.
            </p>

            <button
              onClick={onBackToLogin}
              className="w-full rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 py-3 font-bold text-white"
            >
              Back to Login
            </button>
          </>
        )}

        {!submitted && (
          <button
            type="button"
            onClick={onBackToLogin}
            className="mt-5 w-full text-sm text-purple-300 transition hover:text-white"
          >
            ← Back to Login
          </button>
        )}

      </div>
    </div>
  )
}

export default ForgotPassword
import { useState } from "react"
import { motion } from "framer-motion"
import FloatingIcons from "./FloatingIcons"


function Login({ setIsLoggedIn }) {

    const [isRegister, setIsRegister] = useState(false)
    const [confirmPassword, setConfirmPassword] = useState("")
    const [username, setUsername] = useState("")
    const [password, setPassword] = useState("")

    const handleLogin = async () => {

        try {

            const response = await fetch(
                "http://127.0.0.1:8000/api/login/",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        username,
                        password,
                    }),
                }
            )

            const data = await response.json()

            if (response.ok) {

                localStorage.removeItem("access")
                localStorage.removeItem("refresh")

                localStorage.setItem("access", data.access)
                localStorage.setItem("refresh", data.refresh)

                setIsLoggedIn(true)

            } else {

                alert(data.detail)

            }

        } catch (error) {

            console.log(error)

        }

    }

    const handleRegister = async () => {

        if (!username || !password || !confirmPassword) {

            alert("fill all fields")
            return

        }

        if (password.length < 6) {

            alert("Password must be at least 6 characters.")
            

            return

        }

        if (password !== confirmPassword) {

            alert("Passwords do not match")
            return

        }

        try {

            const response = await fetch(
                "http://127.0.0.1:8000/api/register/",
                {
                    method: "POST",

                    headers: {
                        "Content-Type": "application/json",
                    },

                    body: JSON.stringify({
                        username,
                        password,
                    }),
                }
            )

            const data = await response.json()

            if (response.ok) {

                alert("Account created successfully!")

                setIsRegister(false)

                setUsername("")
                setPassword("")
                setConfirmPassword("")

            } else {

                if (data.username) {
                    alert(data.username[0])
                } else {
                    alert("Registration failed")
                }

            }

        } catch (error) {

            console.log(error)

        }

    }

    return (

        <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-zinc-950 via-purple-950 to-black flex items-center justify-center">

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
                className="relative z-10 w-[420px] rounded-[35px] border border-white/10 bg-white/10 backdrop-blur-2xl shadow-2xl shadow-purple-500/40 p-10"
            >

                <h1 className="text-5xl font-extrabold text-white mb-3">
                    {isRegister ? "Create Account" : "Welcome"}
                </h1>

                <p className="text-zinc-300 mb-8">
                    {isRegister
                        ? "Create your Personal Hub account"
                        : "Sign in to your Personal Hub"}
                </p>

                <input
                    type="text"
                    placeholder="Username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full bg-black/30 border border-white/10 rounded-2xl px-5 py-4 text-white outline-none focus:border-purple-500 transition-all mb-4"
                />

                <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-black/30 border border-white/10 rounded-2xl px-5 py-4 text-white outline-none focus:border-purple-500 transition-all mb-6 "
                />

                {isRegister && (

                    <input
                        type="password"
                        placeholder="Confirm Password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="w-full bg-black/30 border border-white/10 rounded-2xl px-5 py-4 text-white outline-none focus:border-purple-500 transition-all mb-6"
                    />
                    

                )}

                <button

                    onClick={isRegister ? handleRegister : handleLogin}
                    className="w-full mt-2 bg-gradient-to-r from-purple-600 to-blue-600 py-4 rounded-2xl font-bold text-white hover:scale-105 transition-all duration-300 shadow-lg shadow-purple-500/30 hover:shadow-purple-500/50
hover:scale-105
active:scale-95"
                >
                    {isRegister ? "Create Account" : "Login"}
                </button>
                <div className="text-center mt-6">

                    {isRegister ? (

                        <p className="text-zinc-400">

                            Already have an account?

                            <button
                                onClick={() => setIsRegister(false)}
                                className="ml-2 text-purple-400 hover:text-purple-300"
                            >
                                Login
                            </button>

                        </p>

                    ) : (

                        <p className="text-zinc-400">

                            Don't have an account?

                            <button
                                onClick={() => setIsRegister(true)}
                                className="ml-2 text-purple-400 hover:text-purple-300"
                            >
                                Create Account
                            </button>

                        </p>

                    )}

                </div>

            </motion.div>

        </div>

    )

}

export default Login
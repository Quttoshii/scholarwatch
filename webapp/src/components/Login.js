import React, { useState } from "react";

function Login({ setUserType, setUserID, setUserName }) {
    const [email, setEmail] = useState(""); // Adding state to handle email input
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState("");

    const handleLogin = (e) => {
        e.preventDefault();
        const loginData = {
            email: email,
            password: password,
        };

        fetch("http://localhost/scholarwatch/fetchlogin.php", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(loginData),
        })
        .then((response) => response.json())
        .then((data) => {
            if (data.error) {
                setError(data.error === "invalid_email" ? "Invalid email" : "Invalid password");
            } else if (data.userType) {
                setUserType(data.userType);
                setUserID(data.userID);
                setUserName(data.userName);
            }
        })
        .catch((error) => {
            setError("An error occurred. Please try again.");
            console.error("Error during login:", error);
        });
    };

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    return (
        <div className="login-container">
            <form className="login-form" onSubmit={handleLogin}>
                <div className="form-group">
                    <label htmlFor="email">Email</label>
                    <input
                        type="email"
                        id="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Enter your email"
                        required
                    />
                </div>
                <div className="form-group password-group">
                    <label htmlFor="password">Password</label>
                    <input
                        type={showPassword ? "text" : "password"}
                        id="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Enter your password"
                        required
                    />
                    <span className="password-toggle-icon" onClick={togglePasswordVisibility}>
                        {showPassword ? '🙈' : '👁️'}
                    </span>
                </div>
                {error && <p className="error">{error}</p>}
                <button type="submit" className="login-button">Login</button>
            </form>
        </div>
    );
}

export default Login;
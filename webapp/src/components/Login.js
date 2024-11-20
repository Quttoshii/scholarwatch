import React, { useState } from "react";

function Login({ setUserType }) {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");

    const handleLogin = (e) => {
        e.preventDefault();
        
        // Prepare login data
        const loginData = {
            email: email,
            password: password,
        };

        // Send login request to PHP backend
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
                    // Handle error response
                    setError(data.error === "invalid_email" ? "Invalid email" : "Invalid password");
                } else if (data.userType) {
                    // Set user type on successful login
                    setUserType(data.userType);
                }
            })
            .catch((error) => {
                setError("An error occurred. Please try again.");
                console.error("Error during login:", error);
            });
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
                <div className="form-group">
                    <label htmlFor="password">Password</label>
                    <input
                        type="password"
                        id="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Enter your password"
                        required
                    />
                </div>
                {error && <p className="error">{error}</p>}
                <button type="submit" className="login-button">
                    Login
                </button>
            </form>
        </div>
    );
}

export default Login;

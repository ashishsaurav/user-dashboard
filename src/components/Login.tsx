import React, { useState } from "react";
import { LoginProps, LoginFormData } from "../types";
import { testUsers } from "../data/testData";
import "./Login.css";

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [formData, setFormData] = useState<LoginFormData>({
    username: "admin",
    password: "admin123",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const user = testUsers.find(
      (u) =>
        u.username === formData.username && u.password === formData.password
    );

    if (user) {
      onLogin(user);
    } else {
      alert("Invalid credentials");
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  return (
    <div className="login-container">
      <form onSubmit={handleSubmit} className="login-form">
        <h2>Login</h2>

        <div className="form-group">
          <label htmlFor="username">Username</label>
          <input
            id="username"
            name="username"
            type="text"
            value={formData.username}
            onChange={handleInputChange}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="password">Password</label>
          <input
            id="password"
            name="password"
            type="password"
            value={formData.password}
            onChange={handleInputChange}
            required
          />
        </div>

        <button type="submit">Login</button>

        <div className="test-credentials">
          <p>Test credentials:</p>
          <p>Admin: admin / admin123</p>
          <p>User: user / user123</p>
          <p>Viewer: viewer / viewer123</p>
        </div>
      </form>
    </div>
  );
};

export default Login;

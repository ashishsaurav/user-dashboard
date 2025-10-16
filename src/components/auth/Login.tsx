import React, { useState } from "react";
import { LoginProps } from "../../types";
import { authService } from "../../services/authService";
import "./styles/Login.css";

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [email, setEmail] = useState("john.admin@company.com");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const user = await authService.login(email);
      onLogin(user);
    } catch (err: any) {
      console.error("Login error:", err);
      setError(err.message || "Login failed. Please check your email.");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
    setError(null);
  };

  return (
    <div className="login-container">
      <form onSubmit={handleSubmit} className="login-form">
        <h2>Dashboard Login</h2>
        
        {error && (
          <div className="error-message" style={{ 
            color: '#f44336', 
            padding: '10px', 
            marginBottom: '15px',
            backgroundColor: '#ffebee',
            borderRadius: '4px',
            fontSize: '14px'
          }}>
            {error}
          </div>
        )}

        <div className="form-group">
          <label htmlFor="email">Email Address</label>
          <input
            id="email"
            name="email"
            type="email"
            value={email}
            onChange={handleInputChange}
            required
            disabled={loading}
            placeholder="Enter your email"
          />
        </div>

        <button type="submit" disabled={loading}>
          {loading ? "Logging in..." : "Login"}
        </button>

        <div className="test-credentials">
          <p><strong>Test Email Addresses:</strong></p>
          <p style={{ cursor: 'pointer' }} onClick={() => setEmail('john.admin@company.com')}>
            👤 Admin: john.admin@company.com
          </p>
          <p style={{ cursor: 'pointer' }} onClick={() => setEmail('alice.dev@company.com')}>
            👤 User: alice.dev@company.com
          </p>
          <p style={{ cursor: 'pointer' }} onClick={() => setEmail('david.view@company.com')}>
            👤 Viewer: david.view@company.com
          </p>
          <p style={{ fontSize: '12px', marginTop: '10px', color: '#666' }}>
            💡 Click on an email to auto-fill
          </p>
        </div>
      </form>
    </div>
  );
};

export default Login;

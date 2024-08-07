import React, { useState, useEffect } from "react";

interface UserSignUp {
  email: string; // The user's email address for signup
  password: string; // The user's chosen password for their account
  confirmPassword: string; // Confirmation of the user's password
}

interface SignUpResponse {
  success: boolean; // Indicates if the sign-up was successful
  userId?: string; // The unique identifier for the new user (optional in case of failure)
  message?: string; // Any relevant message or error details
}

const SignUpForm: React.FC = () => {
  // State for managing form input, loading, and response message
  const [formData, setFormData] = useState<UserSignUp>({ email: '', password: '', confirmPassword: '' });
  const [loading, setLoading] = useState<boolean>(false);
  const [responseMessage, setResponseMessage] = useState<string | null>(null);

  // Handle input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({...formData, [e.target.name]: e.target.value });
  };

  // Handle the form submission
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setResponseMessage(null);
    
    try {
      const res = await fetch('/api/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      const result: SignUpResponse = await res.json();

      if (result.success) {
        setResponseMessage('Sign-up successful! User ID: ' + result.userId);
      } else {
        setResponseMessage(result.message || 'An error occurred during sign-up.');
      }
    } catch (error) {
      setResponseMessage('An error occurred: ' + error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-100 p-4">
      <h2 className="text-2xl font-bold mb-4">Sign Up</h2>
      <form onSubmit={handleSubmit} className="w-full max-w-md space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700" htmlFor="email">Email</label>
          <input
            type="email"
            name="email"
            id="email"
            required
            value={formData.email}
            onChange={handleChange}
            className="mt-1 block w-full border border-gray-300 rounded-md p-2 focus:ring focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700" htmlFor="password">Password</label>
          <input
            type="password"
            name="password"
            id="password"
            required
            value={formData.password}
            onChange={handleChange}
            className="mt-1 block w-full border border-gray-300 rounded-md p-2 focus:ring focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700" htmlFor="confirmPassword">Confirm Password</label>
          <input
            type="password"
            name="confirmPassword"
            id="confirmPassword"
            required
            value={formData.confirmPassword}
            onChange={handleChange}
            className="mt-1 block w-full border border-gray-300 rounded-md p-2 focus:ring focus:ring-blue-500"
          />
        </div>
        <button 
          type="submit" 
          disabled={loading}
          className={`w-full p-2 font-semibold text-white rounded-md ${loading ? 'bg-gray-400' : 'bg-blue-600 hover:bg-blue-700'}`}
        >
          {loading ? 'Signing Up...' : 'Sign Up'}
        </button>
      </form>
      {responseMessage && <p className="mt-4 text-lg text-gray-700">{responseMessage}</p>}
    </div>
  );
};

export default SignUpForm;
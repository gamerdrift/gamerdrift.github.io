import React from 'react';

export default function AuthPage() {
  return (
    <div className="container flex flex-col items-center py-10">
      <h1 className="text-3xl font-bold text-white mb-6 neon">Sign In / Register</h1>
      <form className="w-full max-w-md space-y-4">
        <input
          type="email"
          placeholder="Email"
          className="w-full px-4 py-2 rounded bg-gray-900 bg-opacity-50 text-white focus:outline-none focus:ring-2 focus:ring-neon-pink"
        />
        <input
          type="password"
          placeholder="Password"
          className="w-full px-4 py-2 rounded bg-gray-900 bg-opacity-50 text-white focus:outline-none focus:ring-2 focus:ring-neon-pink"
        />
        <button
          type="submit"
          className="neon-button w-full py-2 font-semibold"
        >
          Continue
        </button>
      </form>
    </div>
  );
}

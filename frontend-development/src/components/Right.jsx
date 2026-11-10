
import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { registerUser, loginUser } from "../services/authservice";
import { useNavigate } from "react-router";

export default function Right() {
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState("login");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("success");

  const isLogin = activeTab === "login";

  function handleChange(e) {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    setErrors((prev) => ({
      ...prev,
      [name]: "",
    }));

    setMessage("");
  }

  function switchTab(tab) {
    setActiveTab(tab);
    setErrors({});
    setMessage("");
    setShowPassword(false);

    setFormData({
      fullName: "",
      email: "",
      password: "",
      confirmPassword: "",
    });
  }

  async function handleSubmit(e) {
    e.preventDefault();

    const newErrors = {};

    if (!isLogin && !formData.fullName.trim()) {
      newErrors.fullName = "Full name is required";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 8) {
      newErrors.password = "Password must contain at least 8 characters";
    }

    if (!isLogin && formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    setErrors(newErrors);
    setMessage("");

    if (Object.keys(newErrors).length > 0) return;

    setLoading(true);

    try {
      if (isLogin) {
        await loginUser({
          email: formData.email.trim(),
          password: formData.password,
        });

        navigate("/dashboard");
      } else {
        await registerUser({
          fullName: formData.fullName.trim(),
          email: formData.email.trim(),
          password: formData.password,
        });

        setMessageType("success");
        setMessage("Account created successfully! You can now log in.");
        switchTab("login");
        setMessageType("success");
        setMessage("Account created successfully! You can now log in.");
      }
    } catch (error) {
      const backendMessage =
        error.response?.data?.message ||
        error.response?.data?.detail ||
        "Something went wrong. Please try again.";

      setMessageType("error");
      setMessage(backendMessage);
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="bg-slate-950 flex items-center justify-center px-6 py-12 md:px-12">
      <div className="w-full max-w-md bg-white p-8 md:p-10 rounded-3xl shadow-2xl border border-slate-200/10">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-slate-900">
            {isLogin ? "Welcome back!" : "Create an account"}
          </h2>

          <p className="mt-2 text-slate-500">
            {isLogin
              ? "Login to continue managing your expenses."
              : "Join Spill and start splitting expenses easily."}
          </p>
        </div>

        <div className="grid grid-cols-2 bg-slate-200/70 p-1 rounded-xl mb-8">
          <button
            type="button"
            onClick={() => switchTab("login")}
            className={`py-3 rounded-lg font-semibold text-sm transition ${
              isLogin
                ? "bg-white text-green-700 shadow-sm"
                : "text-slate-500 hover:text-slate-900"
            }`}
          >
            Login
          </button>

          <button
            type="button"
            onClick={() => switchTab("signup")}
            className={`py-3 rounded-lg font-semibold text-sm transition ${
              !isLogin
                ? "bg-white text-green-700 shadow-sm"
                : "text-slate-500 hover:text-slate-900"
            }`}
          >
            Sign Up
          </button>
        </div>

        <form onSubmit={handleSubmit} noValidate className="space-y-5">
          {!isLogin && (
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Full Name
              </label>

              <input
                name="fullName"
                type="text"
                value={formData.fullName}
                onChange={handleChange}
                placeholder="Enter your full name"
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100"
              />

              {errors.fullName && (
                <p className="text-red-500 text-xs mt-2">{errors.fullName}</p>
              )}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Email Address
            </label>

            <input
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="you@example.com"
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100"
            />

            {errors.email && (
              <p className="text-red-500 text-xs mt-2">{errors.email}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Password
            </label>

            <div className="relative">
              <input
                name="password"
                type={showPassword ? "text" : "password"}
                value={formData.password}
                onChange={handleChange}
                placeholder="Enter your password"
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 pr-12 outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100"
              />

              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400"
              >
                {showPassword ? <EyeOff size={19} /> : <Eye size={19} />}
              </button>
            </div>

            {errors.password && (
              <p className="text-red-500 text-xs mt-2">{errors.password}</p>
            )}
          </div>

          {!isLogin && (
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Confirm Password
              </label>

              <input
                name="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Re-enter your password"
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100"
              />

              {errors.confirmPassword && (
                <p className="text-red-500 text-xs mt-2">
                  {errors.confirmPassword}
                </p>
              )}
            </div>
          )}

          {isLogin && (
            <div className="flex justify-end">
              <button
                type="button"
                className="text-sm font-medium text-green-700 hover:text-green-800"
              >
                Forgot password?
              </button>
            </div>
          )}

          {message && (
            <p
              className={`text-sm p-3 rounded-lg ${
                messageType === "error"
                  ? "text-red-700 bg-red-50"
                  : "text-green-700 bg-green-50"
              }`}
            >
              {message}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-green-600 py-3.5 font-semibold text-white hover:bg-green-700 transition disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading
              ? "Please wait..."
              : isLogin
                ? "Login to Spill"
                : "Create Account"}
          </button>
        </form>

        <p className="mt-8 text-center text-sm text-slate-500">
          {isLogin ? "Don't have an account?" : "Already have an account?"}

          <button
            type="button"
            onClick={() => switchTab(isLogin ? "signup" : "login")}
            className="ml-1 font-semibold text-green-700 hover:underline"
          >
            {isLogin ? "Sign up" : "Login"}
          </button>
        </p>
      </div>
    </section>
  );
}

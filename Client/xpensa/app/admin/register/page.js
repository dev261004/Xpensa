"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Eye,
  EyeOff,
  Mail,
  Lock,
  Store,
  Building,
  CheckCircle,
  ArrowRight,
  ArrowLeft,
} from "lucide-react";

export default function RestaurantRegister() {
  const router = useRouter();
  const [form, setForm] = useState({
    r_name: "",
    email: "",
    password: "",
    confirmPassword: "",
    country: "",
    currency: "",
  });
  const [countries, setCountries] = useState([]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [cshowPassword, csetShowPassword] = useState(false);

  // ✅ Fetch Countries
  useEffect(() => {
    fetch("https://api.sampleapis.com/countries/countries")
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP error! Status: ${res.status}`);
        return res.json();
      })
      .then((data) => {
        if (data && Array.isArray(data)) {
          const countriesList = data
            .map((country) => ({
              name: country.name,
              currency: country.currency,
            }))
            .sort((a, b) => a.name.localeCompare(b.name));
          setCountries(countriesList);
        } else {
          console.error("Unexpected data structure:", data);
          setCountries([]);
        }
      })
      .catch((err) => {
        console.error("Error fetching countries:", err);
        setError("Failed to fetch country data");
      });
  }, []);

  // ✅ Handle Input Change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (name === "country") {
      const found = countries.find((c) => c.name === value);
      if (found) {
        setForm((prev) => ({
          ...prev,
          currency: found.currency || "USD",
        }));
      } else {
        setForm((prev) => ({ ...prev, currency: "" }));
      }
    }
  };

  // ✅ Handle Submit with Backend Integration
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    // Basic validation
    if (
      !form.email ||
      !form.password ||
      !form.confirmPassword ||
      !form.country ||
      !form.currency ||
      !form.r_name
    ) {
      setError("All fields are required");
      setLoading(false);
      return;
    }

    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }

    try {
      // 🟩 Your teammate's backend register API integration
      const res = await fetch("http://localhost:3010/api/v1/users/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.r_name,
          email: form.email,
          password: form.password,
          confirmPassword: form.confirmPassword,
          country: form.country,
        }),
      });

      console.log("Status:", res.status);
      console.log("Content-Type:", res.headers.get("content-type"));

      const text = await res.text();
      console.log("Raw Response:", text);

      try {
        const body = JSON.parse(text);
        if (!res.ok) throw new Error(body.message || "Registration failed");
        setSuccess("User registered successfully!");
      } catch (e) {
        console.error("JSON Parse Error:", e);
        setError("Unexpected response from server.");
      }

        // Redirect after success
      setTimeout(() => {
        router.push("/admin/login");
      }, 2000);
    } catch (err) {
      console.error("Register Error:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const validateForm = () => {
    return (
      form.email &&
      form.password &&
      form.confirmPassword &&
      form.country &&
      form.currency &&
      form.r_name
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-500 rounded-2xl shadow-lg mb-4">
            <Building className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Join Our Platform
          </h1>
          <p className="text-gray-600">Start your journey as a partner</p>
        </div>

        <div className="bg-white/70 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20 p-8">
          {success && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center space-x-3 mb-6">
              <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0" />
              <div>
                <p className="text-green-800 font-medium">Success!</p>
                <p className="text-green-700 text-sm">{success}</p>
                <p className="text-green-600 text-xs mt-1">
                  Redirecting to login...
                </p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center space-x-2">
                <div className="w-2 h-2 bg-red-500 rounded-full flex-shrink-0"></div>
                <p className="text-red-700 text-sm">{error}</p>
              </div>
            )}

            {/* Admin Name */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Admin Name *
              </label>
              <div className="relative">
                <Store className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  name="r_name"
                  placeholder="Your name"
                  value={form.r_name}
                  onChange={handleChange}
                  required
                  className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200 bg-white/50"
                />
              </div>
            </div>

            {/* Email */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Email Address *
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="email"
                  name="email"
                  placeholder="Business email"
                  value={form.email}
                  onChange={handleChange}
                  required
                  className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200 bg-white/50"
                />
              </div>
            </div>

            {/* Country */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Country *
              </label>
              <div className="relative">
                <select
                  name="country"
                  value={form.country}
                  onChange={handleChange}
                  required
                  className="w-full pl-4 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200 bg-white/50">
                  <option value="">Select Country</option>
                  {countries.map((country) => (
                    <option key={country.name} value={country.name}>
                      {country.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Password */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Password *
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="Create a strong password"
                  value={form.password}
                  onChange={handleChange}
                  required
                  className="w-full pl-12 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200 bg-white/50"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors">
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Confirm Password *
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type={cshowPassword ? "text" : "password"}
                  name="confirmPassword"
                  placeholder="Confirm password"
                  value={form.confirmPassword}
                  onChange={handleChange}
                  required
                  className="w-full pl-12 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200 bg-white/50"
                />
                <button
                  type="button"
                  onClick={() => csetShowPassword(!cshowPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors">
                  {cshowPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            {/* Register Button */}
            <button
              type="submit"
              disabled={loading || !validateForm()}
              className="w-full bg-gradient-to-r from-green-500 to-emerald-500 text-white py-3 rounded-lg hover:from-green-600 hover:to-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center space-x-2 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5">
              {loading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
              ) : (
                <>
                  <span className="font-medium">Create Account</span>
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>

            {/* Back to Home */}
            <button
              type="button"
              onClick={() => router.push("/")}
              className="w-full bg-white border-2 border-gray-300 text-gray-700 py-3 rounded-lg hover:border-green-400 hover:text-green-600 transition-all duration-200 flex items-center justify-center space-x-2 shadow-sm hover:shadow-md">
              <ArrowLeft className="w-5 h-5" />
              <span className="font-medium">Back to Home</span>
            </button>
          </form>
        </div>

        <div className="text-center mt-6">
          <p className="text-sm text-gray-500">
            By registering, you agree to our terms of service and privacy policy
          </p>
        </div>
      </div>
    </div>
  );
}

import React, { useState, useContext } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { toast } from "react-hot-toast";
import { LogIn } from "lucide-react";
import AuthContext from "../../context/AuthContext";
import Card from "../../components/ui/Card";
import Input from "../../components/ui/Input";
import Button from "../../components/ui/Button";
import api from "../../utils/api";
const Login = () => {
  const [contactNumber, setContactNumber] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const { login } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();

  // Get redirect path from location state or default to home
  const from = location.state?.from?.pathname || "/";

  const validateForm = () => {
    const newErrors = {};

    if (!contactNumber) newErrors.contactNumber = "contactNumber is required";
    else if (contactNumber.length !== 10)
      newErrors.contactNumber = "contactNumber must be  10 digits";

    if (!password) newErrors.password = "Password is required";
    else if (password.length < 6)
      newErrors.password = "Password must be at least 6 characters";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsLoading(true);

    try {
      const response = await api.post(
        "/auth/login",
        { contactNumber, password },
        { withCredentials: true } // important for cookies
      );
      
localStorage.setItem("token",response.data.token);
      const { user } = response.data;

      login(user); // no need to pass token

      toast.success("Login successful");
      navigate(from);
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || error.message || "Login failed";
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto">
      <Card
        title="Welcome Back"
        subtitle="Log in to your account to book cricket boxes"
      >
        <form onSubmit={handleSubmit}>
          <Input
            label="Contact Number"
            id="contactNumber"
            type="tel"
            value={contactNumber}
            onChange={(e) => setContactNumber(e.target.value)}
            placeholder="Enter your contact number"
            error={errors.contactNumber}
          />

          <Input
            label="Password"
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter your password"
            error={errors.password}
          />

          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center">
              <input
                id="remember"
                type="checkbox"
                className="h-4 w-4 text-primary border-base-100 rounded"
              />
              <label htmlFor="remember" className="ml-2 block text-sm  ">
                Remember me
              </label>
            </div>

            <Link to="/forgot-password" className="   hover:text-primary">
              Forgot password?
            </Link>
          </div>

          <Button
            type="submit"
            variant="primary"
            fullWidth
            isLoading={isLoading}
            className="flex justify-center items-center"
          >
            <LogIn size={18} className="mr-2" />
            Log in
          </Button>
        </form>

        <div className="mt-6 text-center text-sm">
          <span className="text-gray-600 dark:text-gray-400">
            Don't have an account?{" "}
          </span>
          <Link
            to="/signup"
            className=" hover:text-primary  dark:hover:text-yellow-300 font-medium"
          >
            Sign up
          </Link>
        </div>
      </Card>
    </div>
  );
};

export default Login;

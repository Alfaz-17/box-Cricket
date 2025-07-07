import React, { useState } from "react";
import { toast } from "react-hot-toast";
import { Link, useNavigate } from "react-router-dom";
import Card from "../../components/ui/Card";
import Input from "../../components/ui/Input";
import Button from "../../components/ui/Button";
import api from "../../utils/api";


const ForgotPassword = () => {
  const [step, setStep] = useState(1);
  const [contactNumber, setContactNumber] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const navigate = useNavigate();

  const validateContact = () => {
    const errs = {};
    if (!contactNumber) errs.contactNumber = "Contact number is required";
    else if (contactNumber.length !== 10)
      errs.contactNumber = "Must be 10 digits";

    return Object.keys(errs).length === 0;
  };

  const handleSendOtp = async () => {
    if (!validateContact()) return;

    try {
      await api.post("/auth/otp", { contactNumber, action: "forgot-password" });
      toast.success("OTP sent to your number");
      setStep(2);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to send OTP");
     
    }
  };

  const handleVerifyOtp = async () => {
    if (!otp) return toast.error("Enter OTP");

    try {
      await api.post("/auth/verify-otp", { contactNumber, otp });
      toast.success("OTP verified");
      setStep(3);
    } catch (err) {
      toast.error(err.response?.data?.message || "Invalid OTP");
    }
  };

  const handleResetPassword = async () => {
    if (!newPassword || newPassword.length < 6)
      return toast.error("Password must be at least 6 characters");

    try {
      await api.post("/auth/forgot-password", {
        contactNumber,
        otp,
        newPas: newPassword,
      });
      
      toast.success("Password reset successfully");
      navigate("/login");

    } catch (err) {
      console.log(err);
      toast.error(err.response?.data?.message || "Reset failed");
    }
  };

  return (
    <div className="max-w-md mx-auto">
      <Card title="Forgot Password" subtitle="Reset your password in 3 steps">
        {step === 1 && (
          <>
            <Input
              label="Contact Number"
              id="contactNumber"
              type="tel"
              value={contactNumber}
              onChange={(e) => setContactNumber(e.target.value)}
              placeholder="Enter your registered number"
            />
            <Button variant="primary" fullWidth onClick={handleSendOtp}>
              Send OTP
            </Button>
          </>
        )}

        {step === 2 && (
          <>
            <Input
              label="OTP"
              id="otp"
              type="text"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              placeholder="Enter OTP"
            />
            <Button variant="primary" fullWidth onClick={handleVerifyOtp}>
              Verify OTP
            </Button>
          </>
        )}

        {step === 3 && (
          <>
            <Input
              label="New Password"
              id="newPassword"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Enter new password"
            />
            <Button variant="primary" fullWidth onClick={handleResetPassword}>
              Reset Password
            </Button>
          </>
        )}

        <div className="mt-6 text-center text-sm">
          <span className="text-gray-600 dark:text-gray-400">
            Remember your password?{" "}
          </span>
          <Link to="/login" className=" hover:primary  ">
            Login
          </Link>
        </div>
      </Card>
    </div>
  );
};

export default ForgotPassword;

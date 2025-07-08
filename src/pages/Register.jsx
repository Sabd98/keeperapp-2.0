import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router";
import { User, Mail, Lock } from "lucide-react";
import { Button, TextField, Box, Alert } from "@mui/material";
import { register } from "../store/features/authSlice";

export default function Register() {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
  });

  const dispatch = useDispatch();
  const { status, error } = useSelector((state) => state.auth);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    dispatch(register(formData))
      .unwrap()
      .then(() => {
        alert("Registration successful! Please login.");
        navigate("/login");
      });
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <Box
        component="form"
        onSubmit={handleSubmit}
        className="bg-white p-8 rounded-lg shadow-md w-full max-w-md"
      >
        <h2 className="text-2xl font-bold mb-6 text-center">Create Account</h2>

        {error && (
          <Alert severity="error" className="mb-4">
            {error}
          </Alert>
        )}

        <TextField
          fullWidth
          name="username"
          label="Username"
          variant="outlined"
          margin="normal"
          value={formData.username}
          onChange={handleChange}
          InputProps={{
            startAdornment: <User className="mr-2" size={20} />,
          }}
          required
        />

        <TextField
          fullWidth
          name="email"
          label="Email"
          type="email"
          variant="outlined"
          margin="normal"
          value={formData.email}
          onChange={handleChange}
          InputProps={{
            startAdornment: <Mail className="mr-2" size={20} />,
          }}
          required
        />

        <TextField
          fullWidth
          name="password"
          label="Password"
          type="password"
          variant="outlined"
          margin="normal"
          value={formData.password}
          onChange={handleChange}
          InputProps={{
            startAdornment: <Lock className="mr-2" size={20} />,
          }}
          required
        />

        <Button
          fullWidth
          variant="contained"
          color="primary"
          type="submit"
          disabled={status === "loading"}
          className="mt-4"
        >
          {status === "loading" ? "Creating account..." : "Register"}
        </Button>

        <div className="mt-4 text-center">
          <p className="text-gray-600">
            Already have an account?{" "}
            <Button
              variant="text"
              size="small"
              onClick={() => navigate("/login")}
            >
              Sign in
            </Button>
          </p>
        </div>
      </Box>
    </div>
  );
}

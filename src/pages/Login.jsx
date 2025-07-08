import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router";
import { Lock, User } from "lucide-react";
import { Button, TextField, Box } from "@mui/material";
import { login } from "../store/features/authSlice";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const dispatch = useDispatch();
  const { status } = useSelector((state) => state.auth);
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    dispatch(login({ username, password }))
      .unwrap()
      .then((payload) => {
        // Payload sekarang berisi { token, username }
        localStorage.setItem("token", payload.token);
        localStorage.setItem("username", payload.username);

        const expiryDate = Date.now() + 3600000;
        localStorage.setItem("tokenExpiry", expiryDate);

        navigate("/");
      })
      .catch((error) => {
        console.error("Login error:", error);
        alert(`Login failed: ${error.message || "Unknown error"}`);
      });
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <Box
        component="form"
        onSubmit={handleSubmit}
        className="bg-white p-8 rounded-lg shadow-md w-full max-w-md"
      >
        <h2 className="text-2xl font-bold mb-6 text-center">
          Login to Google Keep
        </h2>

        <TextField
          fullWidth
          label="Username"
          variant="outlined"
          margin="normal"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          InputProps={{
            startAdornment: <User className="mr-2" size={20} />,
          }}
        />

        <TextField
          fullWidth
          label="Password"
          type="password"
          variant="outlined"
          margin="normal"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          InputProps={{
            startAdornment: <Lock className="mr-2" size={20} />,
          }}
        />

        <Button
          fullWidth
          variant="contained"
          color="primary"
          type="submit"
          disabled={status === "loading"}
          className="mt-4"
        >
          {status === "loading" ? "Logging in..." : "Login"}
        </Button>

        <div className="mt-4 text-center">
          <Button variant="text" onClick={() => navigate("/register")}>
            Create new account
          </Button>
        </div>
      </Box>
    </div>
  );
}

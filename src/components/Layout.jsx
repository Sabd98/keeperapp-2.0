import { Outlet } from "react-router";
import { useDispatch, useSelector } from "react-redux";
import { LogOut } from "lucide-react";
import { AppBar, Toolbar, IconButton, Typography } from "@mui/material";
import { logout } from "../store/features/authSlice";

export default function Layout() {
  const dispatch = useDispatch();
  const username = useSelector((state) => state.auth.username);

  const handleLogout = () => {
    dispatch(logout());
  };

  return (
    <div className="min-h-screen flex flex-col">
      <AppBar position="static" color="default">
        <Toolbar className="flex justify-between">
          <Typography variant="h6">Google Keep</Typography>
          <div className="flex items-center">
            <span className="mr-4">Hello, {username}</span>
            <IconButton onClick={handleLogout} color="inherit" title="Logout">
              <LogOut size={20} />
            </IconButton>
          </div>
        </Toolbar>
      </AppBar>

      <main className="flex-grow p-4 bg-slate-200">
        <Outlet />
      </main>

      <footer className="bg-gray-300 shadow-md p-4 text-center">
        © {new Date().getFullYear()} Sabda Keep
      </footer>
    </div>
  );
}

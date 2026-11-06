import { useState, type FormEvent } from "react";
import { useDispatch } from "react-redux";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "sonner";
import { userLogin } from "@/redux/authThunk";
import type { AppDispatch } from "@/redux/store";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const location = useLocation();

  const from =
    (location.state as { from?: { pathname: string } })?.from?.pathname || "/";

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast.error("Please enter your email");
      return;
    }

    if (!password) {
      toast.error("Please enter password");
      return;
    }

    try {
      const resultAction = await dispatch(userLogin({ email, password }));
      console.log(resultAction);

      if (userLogin.rejected.match(resultAction)) {
        let msg = "Login failed";
        if (typeof resultAction.payload === "string") {
          msg = resultAction.payload;
        } else if (
          resultAction.payload &&
          typeof resultAction.payload === "object" &&
          "message" in resultAction.payload
        ) {
          msg = (resultAction.payload as { message?: string }).message || msg;
        }
        toast.error(msg);
        return;
      } else {
        toast.success("Login successful");
      }
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Login failed");
      return;
    }

    toast.success("Logged in successfully");
    navigate(from, { replace: true });
  };

  // const handleQuickLogin = (
  //   role: RoleType,
  //   demoEmail: string,
  //   demoName: string,
  // ) => {
  //   dispatch(
  //     login({
  //       user: {
  //         id: "usr-" + role.toLowerCase(),
  //         name: demoName,
  //         email: demoEmail,
  //         role,
  //       },
  //       token: "f9-token-" + role.toLowerCase(),
  //     }),
  //   );

  //   toast.success(`Logged in as ${role}`);
  //   navigate(from, { replace: true });
  // };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900 p-6">
      <div className="max-w-lg w-full bg-slate-800 border border-slate-700 rounded-2xl shadow-2xl p-8 text-white">
        <div className="text-center mb-6">
          <div className="w-14 h-14 bg-blue-600 text-white rounded-xl flex items-center justify-center mx-auto mb-3 font-bold text-2xl shadow-lg shadow-blue-500/30">
            F9
          </div>
        </div>

        <div className="relative flex py-2 items-center mb-6">
          <div className="flex-grow border-t border-slate-700"></div>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="user@f9infotech.com"
              className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <button
            type="submit"
            className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg text-sm transition shadow-md shadow-blue-600/30"
          >
            Sign In
          </button>
        </form>
      </div>
    </div>
  );
}

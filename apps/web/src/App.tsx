import "./App.css";
import { Toaster } from "sonner";
import { BrowserRouter, useRoutes } from "react-router-dom";
import { routes } from "./routes/Index";

function AppRoutes() {
  return useRoutes(routes);
}

function App() {
  return (
    <>
      <Toaster richColors position="top-center" />
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </>
  );
}

export default App;

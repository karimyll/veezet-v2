import { createBrowserRouter } from "react-router-dom";
import Home from "../pages/home";
import Products from "../pages/products";
import ErrorPage from "../pages/ErrorPage";
import '../assets/css/index.css';

const routes = createBrowserRouter([
    {
        path: "/",
        element: <Home />
    },
    {
        path: "/products",
        element: <Products />
    },
    {
        path: "*",
        element: <ErrorPage />
    }

])

export default routes;
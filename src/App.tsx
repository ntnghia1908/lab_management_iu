import {ThemeProvider, CssBaseline} from '@mui/material';
import Navbar from "./components/Navbar/Navbar";
import './App.css';

import {ThemeContext} from "./theme/ThemeContext.tsx";
import React, {Fragment, useContext, useEffect} from "react";
import {Outlet, useLocation} from "react-router-dom";
import {useAppDispatch} from "./state/store.ts";
import {getUser} from "./state/Authentication/Reducer.ts";
import ScrollToTopButton from "./components/Home/ScrollToTopButton.tsx";
import Footer from "./components/Home/Footer.tsx";
import MultiItemCarousel from "./components/Home/MultiItemCarousel.tsx";
import {createTheme} from "@mui/material/styles";
import getThemeSignInSignUp from "./theme/getThemeSignInSignUp.ts";
import {SidebarProvider} from "./context/SidebarContext.tsx";
import useUserActivityCheck from "./utils/useTabVisibilityCheck.ts";


const App: React.FC = () => {
    const dispatch = useAppDispatch();
    const location = useLocation();

    useUserActivityCheck();
    
    // Fetch user data on initial load if token exists
    useEffect(() => {
        // Set default auth header if token exists
        const storedAccessToken = localStorage.getItem('accessToken');
        
        if (storedAccessToken) {
            // Apply the token to axios default headers
            import("axios").then(axios => {
                axios.default.defaults.headers.common['Authorization'] = `Bearer ${storedAccessToken}`;
            });
            
            // Get user profile
            dispatch(getUser())
                .unwrap()
                .catch(error => {
                    console.error("Error fetching user data:", error);
                    // Don't remove token here as the token refresh interceptor will handle it
                });
        } else {
            console.log("No access_token found in localStorage");
        }
    }, [dispatch]);

    const {isDarkMode, showCustomTheme} = useContext(ThemeContext);
    const mode = isDarkMode ? 'dark' : 'light';
    const defaultTheme = createTheme({palette: {mode}});
    const signInSignUpTheme = createTheme(getThemeSignInSignUp(mode));
    const themeToApply = showCustomTheme ? signInSignUpTheme : defaultTheme;
    const isHomePage = location.pathname === "/";

    return (
        <SidebarProvider>
            <ThemeProvider theme={themeToApply}>
                <Fragment>
                    <CssBaseline/>
                    <Navbar/>
                    {isHomePage && (
                        <section>
                            <MultiItemCarousel/>
                        </section>
                    )}
                    <ScrollToTopButton/>
                    <div className="mx-3">
                        <Outlet/>
                    </div>
                    {isHomePage && <Footer/>}
                </Fragment>
            </ThemeProvider>

        </SidebarProvider>
    );
}

export default App;

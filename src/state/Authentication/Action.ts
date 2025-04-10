import {createSlice} from "@reduxjs/toolkit";
import {
    forgotPassword,
    getUser,
    loginUser,
    logout,
    registerUser,
    resetPassword, sendTFAEmail, toggleTfaFactor,
    validateResetCode,
    verifyOtp, verifyTFAEmail
} from "./Reducer.ts";


export interface Auth {
    access_token: string;
    refresh_token: string;
    role: string;
    message: string;
    secretImageUri:string ;
    tfaEnabled: boolean;
}

export interface User {
    id: number;
    firstName: string;
    lastName: string;
    username: string;
    fullName: string;
    phoneNumber: string;
    email: string;
    image:string;
    role: Role;
    twoFactorEnabled:boolean;
    accountLocked: boolean;
    enabled: boolean;
    createdDate: string;
    lastModifiedDate: string;
}


export enum Role {
    STUDENT = "STUDENT",
    TEACHER = "TEACHER",
    ADMIN = "ADMIN",
    OWNER="OWNER",
    CO_OWNER="CO_OWNER"
}

interface AuthState {
    auth: Auth | null;
    isLoading: boolean;
    error: string | null;
    success: string | null;
    user: User | null;
}

const initialState: AuthState = {
    auth: null,
    user: null,
    success:'',
    isLoading: false,
    error: null,
};


export const authSlice = createSlice({
    name: "auth",
    initialState,
    reducers: {
        clearStatus: (state) => {
            state.success = null;
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder
            // Register user
            .addCase(registerUser.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(registerUser.fulfilled, (state, action) => {
                state.isLoading = false;
                state.success = action.payload.message;
            })
            .addCase(registerUser.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            })

            //login user
            .addCase(loginUser.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(loginUser.fulfilled, (state, action) => {
                state.isLoading = false;
                state.auth = action.payload.tfaEnabled ? null : action.payload;
                state.success = action.payload.tfaEnabled
                    ? "Please enter the OTP code after scanning the QR code."
                    : null;
            })
            .addCase(loginUser.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;

            })
            //getUser
            .addCase(getUser.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(getUser.fulfilled, (state, action) => {
                state.isLoading = false;
                state.user = action.payload;
            })
            .addCase(getUser.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            })
            //logout
            .addCase(logout.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(logout.fulfilled, (state) => {
                state.user = null;
                state.isLoading = false;
            })
            .addCase(logout.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            })
            //forgotPassword
            .addCase(forgotPassword.pending,(state)=>{
                state.isLoading = true;
                state.error=null;
            })
            .addCase(forgotPassword.fulfilled, (state) => {
                state.isLoading = false;
                // state.success=action.payload;
                // state.error=null;
            })
            .addCase(forgotPassword.rejected, (state) => {
                state.isLoading = false;
                // state.success='';
                // state.error=action.payload as string;
            })
        //validate reset code
            .addCase(validateResetCode.pending,(state)=>{
                state.isLoading = true;
                state.error=null;
            })
            .addCase(validateResetCode.fulfilled, (state) => {
                state.isLoading = false;
                // state.success=action.payload;
                // state.error=null;
            })
            .addCase(validateResetCode.rejected,(state, action)=>{
                state.isLoading = false;
                // state.success='';
                state.error=action.payload as string;
            })
        //reset password
            .addCase(resetPassword.pending,(state)=>{
                state.isLoading = true;
                state.error=null;
            })
            .addCase(resetPassword.fulfilled, (state) => {
                state.isLoading = false;
                // state.success=action.payload;
                state.error=null;
            })
            .addCase(resetPassword.rejected,(state, action)=>{
                state.isLoading = false;
                // state.success='';
                state.error=action.payload as string;
            })
            //verify otp
            .addCase(verifyOtp.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(verifyOtp.fulfilled, (state, action) => {
                state.isLoading = false;
                state.auth = action.payload;
                state.success = 'OTP Verified Successfully';
            })
            .addCase(verifyOtp.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
                state.success = '';
            })
            //toggle tfa
            .addCase(toggleTfaFactor.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(toggleTfaFactor.fulfilled, (state, action) => {
                state.isLoading = false;
                if (state.auth) {
                    state.auth.tfaEnabled = action.payload.tfaEnabled;
                    state.auth.secretImageUri = action.payload.secretImageUri;
                }
                state.success = action.payload.message;
            })
            .addCase(toggleTfaFactor.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
                state.success = '';
            })
            //tfa email
            .addCase(sendTFAEmail.pending,(state)=>{
                state.isLoading = true;
            })
            .addCase(sendTFAEmail.fulfilled, (state) => {
                state.isLoading = false;

            })
            .addCase(sendTFAEmail.rejected, (state) => {
                state.isLoading = false;
            })
            //verifyTFAEmail
            .addCase(verifyTFAEmail.pending,(state)=>{
                state.isLoading = true;
            })
            .addCase(verifyTFAEmail.fulfilled, (state) => {
                state.isLoading = false;
            })
            .addCase(verifyTFAEmail.rejected, (state) => {
                state.isLoading = false;
            })


    },
});
export const { clearStatus } = authSlice.actions;
export default authSlice.reducer;

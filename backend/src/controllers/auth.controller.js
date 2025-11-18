import passport from '../config/passport.js';
import bcrypt from 'bcryptjs';
import prisma from '../config/database.js';
import { stravaService } from '../services/strava.service.js';
import { jwtService } from '../services/jwt.service.js';
import { emailService } from '../services/email.service.js';

// ==================== JWT Authentication ====================

/**
 * Register new user with email/password
 */
export const register = async (req, res) => {
 try {
 const { email, password, firstName, lastName } = req.body;

 // Validation
 if (!email || !password) {
 return res.status(400).json({ error: 'Email and password are required' });
 }

 if (password.length < 8) {
 return res.status(400).json({ error: 'Password must be at least 8 characters long' });
 }

 // Check if user already exists
 const existingUser = await prisma.user.findUnique({
 where: { email },
 });

 if (existingUser) {
 return res.status(400).json({ error: 'User with this email already exists' });
 }

 // Hash password
 const hashedPassword = await bcrypt.hash(password, 10);

 // Create user - AUTO-VERIFIED (no email confirmation required)
 const user = await prisma.user.create({
 data: {
 email,
 password: hashedPassword,
 firstName,
 lastName,
 isEmailVerified: true, // Auto-verify for simplicity
 userStats: {
 create: {},
 },
 },
 });

 // Optionally send welcome email (non-blocking)
 try {
 await emailService.sendWelcomeEmail(email, firstName);
 } catch (emailError) {
 console.error('Failed to send welcome email:', emailError);
 // Continue even if email fails
 }

 res.status(201).json({
 message: 'Registration successful. You can now log in.',
 user: {
 id: user.id,
 email: user.email,
 firstName: user.firstName,
 lastName: user.lastName,
 },
 });
 } catch (error) {
 console.error('Registration error:', error);
 res.status(500).json({ error: 'Registration failed' });
 }
};

/**
 * Verify email with token
 */
export const verifyEmail = async (req, res) => {
 try {
 const { token } = req.body;

 if (!token) {
 return res.status(400).json({ error: 'Verification token is required' });
 }

 const user = await prisma.user.findFirst({
 where: {
 emailVerificationToken: token,
 emailVerificationExpires: {
 gt: new Date(),
 },
 },
 });

 if (!user) {
 return res.status(400).json({ error: 'Invalid or expired verification token' });
 }

 // Update user
 await prisma.user.update({
 where: { id: user.id },
 data: {
 isEmailVerified: true,
 emailVerificationToken: null,
 emailVerificationExpires: null,
 },
 });

 // Send welcome email
 try {
 await emailService.sendWelcomeEmail(user.email, user.firstName);
 } catch (emailError) {
 console.error('Failed to send welcome email:', emailError);
 }

 res.json({ message: 'Email verified successfully. You can now log in.' });
 } catch (error) {
 console.error('Email verification error:', error);
 res.status(500).json({ error: 'Email verification failed' });
 }
};

/**
 * Resend verification email
 */
export const resendVerification = async (req, res) => {
 try {
 const { email } = req.body;

 if (!email) {
 return res.status(400).json({ error: 'Email is required' });
 }

 const user = await prisma.user.findUnique({
 where: { email },
 });

 if (!user) {
 return res.status(404).json({ error: 'User not found' });
 }

 if (user.isEmailVerified) {
 return res.status(400).json({ error: 'Email is already verified' });
 }

 // Generate new verification token
 const verificationToken = jwtService.generateEmailVerificationToken();
 const verificationExpires = new Date();
 verificationExpires.setHours(verificationExpires.getHours() + 24);

 await prisma.user.update({
 where: { id: user.id },
 data: {
 emailVerificationToken: verificationToken,
 emailVerificationExpires: verificationExpires,
 },
 });

 // Send verification email
 await emailService.sendVerificationEmail(email, verificationToken);

 res.json({ message: 'Verification email sent' });
 } catch (error) {
 console.error('Resend verification error:', error);
 res.status(500).json({ error: 'Failed to resend verification email' });
 }
};

/**
 * Login with email/password
 */
export const login = async (req, res) => {
 try {
 const { email, password } = req.body;

 if (!email || !password) {
 return res.status(400).json({ error: 'Email and password are required' });
 }

 // Find user
 const user = await prisma.user.findUnique({
 where: { email },
 include: {
 userStats: true,
 },
 });

 if (!user) {
 return res.status(401).json({ error: 'Invalid email or password' });
 }

 // Check password
 const isPasswordValid = await bcrypt.compare(password, user.password);
 if (!isPasswordValid) {
 return res.status(401).json({ error: 'Invalid email or password' });
 }

 // Email verification check removed - auto-verified on registration

 // Generate tokens
 const accessToken = jwtService.generateAccessToken(user.id);
 const refreshToken = await jwtService.generateRefreshToken(user.id);

 res.json({
 message: 'Login successful',
 accessToken,
 refreshToken,
 user: {
 id: user.id,
 email: user.email,
 firstName: user.firstName,
 lastName: user.lastName,
 hasStravaData: !!user.stravaId,
 hasGarminData: !!user.garminId,
 stats: user.userStats,
 },
 });
 } catch (error) {
 console.error('Login error:', error);
 res.status(500).json({ error: 'Login failed' });
 }
};

/**
 * Refresh access token
 */
export const refresh = async (req, res) => {
 try {
 const { refreshToken } = req.body;

 if (!refreshToken) {
 return res.status(400).json({ error: 'Refresh token is required' });
 }

 // Verify refresh token
 const decoded = await jwtService.verifyRefreshToken(refreshToken);

 // Generate new access token
 const newAccessToken = jwtService.generateAccessToken(decoded.userId);

 res.json({
 accessToken: newAccessToken,
 });
 } catch (error) {
 console.error('Token refresh error:', error);
 res.status(401).json({ error: 'Invalid or expired refresh token' });
 }
};

/**
 * Logout (revoke refresh token)
 */
export const logout = async (req, res) => {
 try {
 const { refreshToken } = req.body;

 if (refreshToken) {
 await jwtService.revokeRefreshToken(refreshToken);
 }

 // Also destroy session if exists
 if (req.session) {
 req.session.destroy();
 }

 res.json({ message: 'Logged out successfully' });
 } catch (error) {
 console.error('Logout error:', error);
 res.status(500).json({ error: 'Logout failed' });
 }
};

/**
 * Request password reset
 */
export const forgotPassword = async (req, res) => {
 try {
 const { email } = req.body;

 if (!email) {
 return res.status(400).json({ error: 'Email is required' });
 }

 const user = await prisma.user.findUnique({
 where: { email },
 });

 // Don't reveal if user exists
 if (!user) {
 return res.json({ message: 'If the email exists, a password reset link has been sent' });
 }

 // Generate reset token
 const resetToken = jwtService.generatePasswordResetToken();
 const resetExpires = new Date();
 resetExpires.setHours(resetExpires.getHours() + 1); // 1 hour

 await prisma.user.update({
 where: { id: user.id },
 data: {
 resetPasswordToken: resetToken,
 resetPasswordExpires: resetExpires,
 },
 });

 // Send reset email
 try {
 await emailService.sendPasswordResetEmail(email, resetToken);
 } catch (emailError) {
 console.error('Failed to send reset email:', emailError);
 }

 res.json({ message: 'If the email exists, a password reset link has been sent' });
 } catch (error) {
 console.error('Forgot password error:', error);
 res.status(500).json({ error: 'Failed to process password reset request' });
 }
};

/**
 * Reset password with token
 */
export const resetPassword = async (req, res) => {
 try {
 const { token, newPassword } = req.body;

 if (!token || !newPassword) {
 return res.status(400).json({ error: 'Token and new password are required' });
 }

 if (newPassword.length < 8) {
 return res.status(400).json({ error: 'Password must be at least 8 characters long' });
 }

 const user = await prisma.user.findFirst({
 where: {
 resetPasswordToken: token,
 resetPasswordExpires: {
 gt: new Date(),
 },
 },
 });

 if (!user) {
 return res.status(400).json({ error: 'Invalid or expired reset token' });
 }

 // Hash new password
 const hashedPassword = await bcrypt.hash(newPassword, 10);

 // Update password and clear reset token
 await prisma.user.update({
 where: { id: user.id },
 data: {
 password: hashedPassword,
 resetPasswordToken: null,
 resetPasswordExpires: null,
 },
 });

 // Revoke all refresh tokens for security
 await jwtService.revokeAllUserTokens(user.id);

 res.json({ message: 'Password reset successful. Please log in with your new password.' });
 } catch (error) {
 console.error('Reset password error:', error);
 res.status(500).json({ error: 'Password reset failed' });
 }
};

/**
 * Get current user (JWT-based)
 */
export const getCurrentUser = async (req, res) => {
 try {
 const user = await prisma.user.findUnique({
 where: { id: req.user.userId },
 include: {
 userStats: true,
 },
 });

 if (!user) {
 return res.status(404).json({ error: 'User not found' });
 }

 res.json({
 user: {
 id: user.id,
 email: user.email,
 firstName: user.firstName,
 lastName: user.lastName,
 isEmailVerified: user.isEmailVerified,
 hasStravaData: !!user.stravaId,
 hasGarminData: !!user.garminId,
 stats: user.userStats,
 },
 });
 } catch (error) {
 console.error('Get user error:', error);
 res.status(500).json({ error: 'Failed to get user data' });
 }
};

// ==================== Strava OAuth (Legacy - for linking Strava to existing account) ====================

export const stravaAuth = (req, res) => {
 // Get userId from JWT middleware or from token query parameter
 let userId = req.user?.userId;
 
 // If not from middleware, try to get from query parameter and verify
 if (!userId && req.query.token) {
 try {
 const decoded = jwtService.verifyAccessToken(req.query.token);
 userId = decoded.userId;
 } catch (e) {
 console.warn('Failed to verify token from query:', e);
 }
 }
 
 // Build state with userId
 const stateData = userId 
 ? JSON.stringify({ userId }) 
 : JSON.stringify({ random: Math.random().toString(36).substring(7) });
 
 const stravaAuthUrl = 'https://www.strava.com/oauth/authorize?' + new URLSearchParams({
 client_id: process.env.STRAVA_CLIENT_ID,
 response_type: 'code',
 redirect_uri: process.env.STRAVA_CALLBACK_URL,
 scope: 'activity:read_all,profile:read_all',
 state: stateData,
 });
 
 res.redirect(stravaAuthUrl);
};

export const stravaCallback = async (req, res) => {
 try {
 const { code, state } = req.query;

 const tokenData = await stravaService.exchangeToken(code);
 const athleteData = await stravaService.getAthleteProfile(tokenData.access_token);

 let userId = req.user?.userId;

 // If state contains userId, use it (JWT flow)
 if (state && !userId) {
 try {
 const stateData = JSON.parse(state);
 userId = stateData.userId;
 } catch (e) {
 console.warn('Failed to parse state:', e);
 }
 }

 // If user is logged in via JWT, link Strava to their account
 if (userId) {
 // Check if this Strava account is already linked to another user
 const existingStravaUser = await prisma.user.findUnique({
 where: { stravaId: athleteData.id.toString() },
 });

 if (existingStravaUser && existingStravaUser.id !== userId) {
 // Strava account is already linked to a different user
 return res.redirect(`${process.env.CLIENT_URL}/account?error=strava_already_linked`);
 }

 await prisma.user.update({
 where: { id: userId },
 data: {
 stravaId: athleteData.id.toString(),
 stravaAccessToken: tokenData.access_token,
 stravaRefreshToken: tokenData.refresh_token,
 stravaTokenExpiresAt: new Date(tokenData.expires_at * 1000),
 },
 });
 res.redirect(`${process.env.CLIENT_URL}/account?strava=linked`);
 } else {
 // Legacy: Find or create user by Strava ID (for old flow)
 let user = await prisma.user.findUnique({
 where: { stravaId: athleteData.id.toString() },
 });

 if (!user) {
 user = await prisma.user.create({
 data: {
 stravaId: athleteData.id.toString(),
 email: athleteData.email,
 stravaAccessToken: tokenData.access_token,
 stravaRefreshToken: tokenData.refresh_token,
 stravaTokenExpiresAt: new Date(tokenData.expires_at * 1000),
 isEmailVerified: true, // Auto-verify for Strava users
 userStats: {
 create: {},
 },
 },
 });
 }

 req.session.userId = user.id;
 req.session.accessToken = tokenData.access_token;
 req.session.refreshToken = tokenData.refresh_token;
 req.session.source = 'STRAVA';

 res.redirect(`${process.env.CLIENT_URL}/dashboard?auth=success`);
 }
 } catch (error) {
 console.error('Strava auth error:', error);
 
 // Handle specific errors
 if (error.code === 'P2002') {
 // Unique constraint violation - Strava account already linked
 return res.redirect(`${process.env.CLIENT_URL}/account?error=strava_already_linked`);
 }
 
 res.redirect(`${process.env.CLIENT_URL}/account?error=auth_failed`);
 }
};

export const unlinkStrava = async (req, res) => {
 try {
 const userId = req.user.userId;

 await prisma.user.update({
 where: { id: userId },
 data: {
 stravaId: null,
 stravaAccessToken: null,
 stravaRefreshToken: null,
 stravaTokenExpiresAt: null,
 },
 });

 res.json({ 
 message: 'Strava account unlinked successfully',
 success: true 
 });
 } catch (error) {
 console.error('Unlink Strava error:', error);
 res.status(500).json({ error: 'Failed to unlink Strava account' });
 }
};

export const garminAuth = (req, res) => {
 res.status(501).json({
 message: 'Garmin authentication not yet implemented',
 note: 'Garmin Connect API requires special partnership agreement',
 });
};

export const garminCallback = (req, res) => {
 res.status(501).json({
 message: 'Garmin authentication not yet implemented',
 });
};

import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import prisma from '../config/database.js';

class JwtService {
 
 generateAccessToken(userId) {
 return jwt.sign(
 { userId, type: 'access' },
 process.env.JWT_SECRET,
 { expiresIn: process.env.JWT_EXPIRES_IN || '1h' }
 );
 }

 async generateRefreshToken(userId) {
 const token = jwt.sign(
 { userId, type: 'refresh' },
 process.env.JWT_REFRESH_SECRET,
 { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d' }
 );

 const expiresIn = process.env.JWT_REFRESH_EXPIRES_IN || '7d';
 const expiresAt = new Date();
 
 const match = expiresIn.match(/^(\d+)([dhms])$/);
 if (match) {
 const value = parseInt(match[1]);
 const unit = match[2];
 
 switch (unit) {
 case 'd': expiresAt.setDate(expiresAt.getDate() + value); break;
 case 'h': expiresAt.setHours(expiresAt.getHours() + value); break;
 case 'm': expiresAt.setMinutes(expiresAt.getMinutes() + value); break;
 case 's': expiresAt.setSeconds(expiresAt.getSeconds() + value); break;
 }
 }

 await prisma.refreshToken.create({
 data: {
 token,
 userId,
 expiresAt,
 },
 });

 return token;
 }

 verifyAccessToken(token) {
 try {
 const decoded = jwt.verify(token, process.env.JWT_SECRET);
 if (decoded.type !== 'access') {
 throw new Error('Invalid token type');
 }
 return decoded;
 } catch (error) {
 throw new Error('Invalid or expired access token');
 }
 }

 async verifyRefreshToken(token) {
 try {
 const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
 if (decoded.type !== 'refresh') {
 throw new Error('Invalid token type');
 }

 const storedToken = await prisma.refreshToken.findUnique({
 where: { token },
 });

 if (!storedToken) {
 throw new Error('Refresh token not found');
 }

 if (storedToken.expiresAt < new Date()) {
 await prisma.refreshToken.delete({ where: { token } });
 throw new Error('Refresh token expired');
 }

 return decoded;
 } catch (error) {
 throw new Error('Invalid or expired refresh token');
 }
 }

 async revokeRefreshToken(token) {
 try {
 await prisma.refreshToken.delete({ where: { token } });
 } catch (error) {
 
 }
 }

 async revokeAllUserTokens(userId) {
 await prisma.refreshToken.deleteMany({
 where: { userId },
 });
 }

 generateEmailVerificationToken() {
 return crypto.randomBytes(32).toString('hex');
 }

 generatePasswordResetToken() {
 return crypto.randomBytes(32).toString('hex');
 }

 async cleanupExpiredTokens() {
 const deleted = await prisma.refreshToken.deleteMany({
 where: {
 expiresAt: {
 lt: new Date(),
 },
 },
 });
 console.log(`Cleaned up ${deleted.count} expired refresh tokens`);
 return deleted.count;
 }
}

export const jwtService = new JwtService();

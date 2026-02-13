import { getEnv } from '@src/config/env/env.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { randomBytes, randomInt } from 'node:crypto';

const config = getEnv();

export class IdentityService {
        private  readonly saltRounds: number = 10;
        private  readonly jwtSecret: string = config.JWT_SECRET;

         async encryptPassword(password: string): Promise<string> {
                return await bcrypt.hash(password, this.saltRounds);
        }

         async decryptPassword(data: {
                plainPassword: string;
                encryptedPassword: string;
        }): Promise<boolean> {
                return await bcrypt.compare(data.plainPassword, data.encryptedPassword);
        }

         generateAccessToken(data: object): string {
                // Generates a short-lived JWT (usually 15m - 1h)
                return jwt.sign(data, this.jwtSecret, { expiresIn: '15m' });
        }

         verifyAccessToken(token: string) {
                try {
                        return jwt.verify(token, this.jwtSecret);
                } catch (error) {
                        return null; // Or throw a custom Domain Error
                }
        }

        /**
         * Generates a high-entropy random string (not a JWT)
         */
         generateRefreshTokenWithExpiry(): { value: string; expiry: Date } {
                return {
                        value: randomBytes(40).toString('hex'),
                        expiry: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days default
                };
        }

        /**
         * @param ttl Number of minutes until expiry
         */
         generateOtpWithExpiry(ttl: number): { value: string; expiry: Date } {
                // Generates a 6-digit numeric OTP
                const value = randomInt(100000, 999999).toString();
                const expiry = new Date(Date.now() + ttl * 60000); // 60,000ms = 1 minute

                return { value, expiry };
        }

         generateResetToken(): { value: string; expiry: Date } {
                // High-entropy hex string for the URL
                const value = randomBytes(32).toString('hex');
                const expiry = new Date(Date.now() + 1 * 60 * 60 * 1000); // 1 hour expiry
                return { value, expiry };
        }
}

/**
 * Authentication utilities for the sample project
 * @module auth
 */

import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { readFileSync } from 'fs';
import path from 'path';

/**
 * User authentication class
 */
export class AuthService {
    constructor(configPath = './config.json') {
        this.config = this.loadConfig(configPath);
        this.users = new Map(); // In production, this would be a database
    }

    /**
     * Load configuration from JSON file
     * @param {string} configPath - Path to config file
     * @returns {Object} Configuration object
     */
    loadConfig(configPath) {
        try {
            const configData = readFileSync(configPath, 'utf8');
            return JSON.parse(configData);
        } catch (error) {
            console.warn('Config file not found, using defaults');
            return {
                jwtSecret: 'default-secret-key',
                bcryptRounds: 10,
                sessionTimeout: 3600
            };
        }
    }

    /**
     * Hash a password using bcrypt
     * @param {string} password - Plain text password
     * @returns {Promise<string>} Hashed password
     */
    async hashPassword(password) {
        const saltRounds = this.config.bcryptRounds || 10;
        return await bcrypt.hash(password, saltRounds);
    }

    /**
     * Verify a password against its hash
     * @param {string} password - Plain text password
     * @param {string} hash - Hashed password
     * @returns {Promise<boolean>} True if password matches
     */
    async verifyPassword(password, hash) {
        return await bcrypt.compare(password, hash);
    }

    /**
     * Authenticate a user
     * @param {string} username - Username
     * @param {string} password - Password
     * @returns {Promise<Object|null>} User object with token or null
     */
    async authenticateUser(username, password) {
        const user = this.users.get(username);

        if (!user) {
            return null;
        }

        const isValidPassword = await this.verifyPassword(password, user.passwordHash);

        if (!isValidPassword) {
            return null;
        }

        // Generate JWT token
        const token = jwt.sign(
            {
                userId: user.id,
                username: user.username,
                role: user.role
            },
            this.config.jwtSecret,
            { expiresIn: this.config.sessionTimeout }
        );

        return {
            id: user.id,
            username: user.username,
            role: user.role,
            token,
            expiresAt: Date.now() + (this.config.sessionTimeout * 1000)
        };
    }

    /**
     * Register a new user
     * @param {string} username - Username
     * @param {string} password - Password
     * @param {string} email - Email address
     * @param {string} role - User role (default: 'user')
     * @returns {Promise<Object>} Created user object
     */
    async registerUser(username, password, email, role = 'user') {
        if (this.users.has(username)) {
            throw new Error('Username already exists');
        }

        const passwordHash = await this.hashPassword(password);
        const userId = Date.now().toString(); // Simple ID generation

        const user = {
            id: userId,
            username,
            email,
            passwordHash,
            role,
            createdAt: new Date().toISOString()
        };

        this.users.set(username, user);
        return { id: user.id, username: user.username, email: user.email, role: user.role };
    }

    /**
     * Verify JWT token
     * @param {string} token - JWT token
     * @returns {Object|null} Decoded token payload or null
     */
    verifyToken(token) {
        try {
            return jwt.verify(token, this.config.jwtSecret);
        } catch (error) {
            return null;
        }
    }

    /**
     * Middleware function for Express.js authentication
     * @param {Object} req - Express request object
     * @param {Object} res - Express response object
     * @param {Function} next - Express next function
     */
    authenticateMiddleware(req, res, next) {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ error: 'No token provided' });
        }

        const token = authHeader.substring(7);
        const decoded = this.verifyToken(token);

        if (!decoded) {
            return res.status(401).json({ error: 'Invalid token' });
        }

        req.user = decoded;
        next();
    }
}

/**
 * Create default auth service instance
 */
export const authService = new AuthService();

/**
 * Convenience functions for common operations
 */
export const authenticateUser = (username, password) =>
    authService.authenticateUser(username, password);

export const registerUser = (username, password, email, role) =>
    authService.registerUser(username, password, email, role);

export const verifyToken = (token) =>
    authService.verifyToken(token);

export default AuthService;
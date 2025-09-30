import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { NextRequest } from 'next/server'
import { prisma } from './prisma'

export interface UserPayload {
  userId: string
  email: string
  subscriptionTier: string
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12)
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword)
}

export function generateToken(payload: UserPayload): string {
  return jwt.sign(payload, process.env.JWT_SECRET!, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d'
  } as jwt.SignOptions)
}

export function verifyToken(token: string): UserPayload | null {
  try {
    return jwt.verify(token, process.env.JWT_SECRET!) as UserPayload
  } catch {
    return null
  }
}

export async function getUserFromToken(token: string) {
  const payload = verifyToken(token)
  if (!payload) return null

  const user = await prisma.user.findUnique({
    where: { id: payload.userId },
    include: {
      credits: true
    }
  })

  return user
}

export async function getUserFromRequest(request: NextRequest) {
  const authHeader = request.headers.get('authorization')
  const token = authHeader?.replace('Bearer ', '')

  if (!token) return null

  return getUserFromToken(token)
}

export function generateEmailVerifyToken(): string {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
}

export function generatePasswordResetToken(): string {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
}
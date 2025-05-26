import { z } from "zod"

export const SignupValidation = z.object({
    name: z.string().min(2, { message: 'Too short!' }),
    username: z.string().min(2, { message: 'Too short!' }),
    email: z.string().email({ message: 'Invalid email address' }),
    password: z.string().min(8, { message: 'Password must be at least 8 characters long' }),
})

export const SigninValidation = z.object({
    email: z.string().email({ message: 'Invalid email address' }),
    password: z.string().min(8, { message: 'Password must be at least 8 characters long' }),
})

export const PostValidation = z.object({
    caption: z.string().min(5).max(2200, { message: 'Caption must be between 5 and 2200 characters' }),
    file: z.custom<File[]>(),
    location: z.string().min(2).max(100, { message: 'Location must be between 2 and 100 characters' }),
    tags: z.string().optional(),
})

export const UpdateProfileValidation = z.object({
    name: z.string().min(2, { message: 'Too short!' }),
    username: z.string().min(2, { message: 'Too short!' }),
    email: z.string().email({ message: 'Invalid email address' }),
    bio: z.string().max(2200, { message: 'Bio must be less than 2200 characters' }),
    file: z.custom<File[]>(),
})
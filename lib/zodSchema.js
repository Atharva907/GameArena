import { z } from 'zod'

export const zSchema = z.object({

  name: z
      .string()  
      .min(2, "Name must be at least 2 characters long")   
      .max(50, "Name must not exceed 50 characters")       
      .regex(/^[a-zA-Z\s]+$/, "Name must only contain letters and spaces"),


  email: z
    .string()                
    .email("Invalid email address") 
    .min(5, "Email must be at least 5 characters long")   
    .max(100, "Email must not exceed 100 characters"),   

  password: z
    .string()                     
    .min(8, "Password must be at least 8 characters long")  
    .max(50, "Password must not exceed 50 characters")      
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")  
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")  
    .regex(/[0-9]/, "Password must contain at least one number")            
    .regex(/[@$!%*?&#]/, "Password must contain at least one special character"),

  otp: z
    .string()                      
    .regex(/^\d{6}$/, "Must be a 6-digit number") 
})
import { PrismaClient } from '@prisma/client'

/**
 * An instance of the PrismaClient, which is used to interact with the database.
 * 
 * @remarks
 * This instance provides methods to perform CRUD operations on the database.
 * 
 * @example
 * ```typescript
 * const users = await prisma.user.findMany();
 * ```
 */
export const prisma = new PrismaClient()
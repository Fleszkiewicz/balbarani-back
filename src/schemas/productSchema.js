import z from 'zod'

const objectIdRegex = /^[0-9a-fA-F]{24}$/

const flavorSchema = z.object({
    name: z.string().trim().min(1, 'El nombre del sabor es requerido'),
    available: z.boolean().optional().default(true),
})

export const productSchema = z
    .object({
        name: z.string().min(3).max(50),
        description: z.string().min(20).max(500),
        price: z.number().min(0),
        imageUrl: z.url(),
        category: z.string().regex(objectIdRegex, 'category debe ser un id válido'),
        subcategory: z
            .string()
            .regex(objectIdRegex, 'subcategory debe ser un id válido')
            .optional(),
        inventoryType: z.enum(['flavor', 'stock']),
        stock: z.number().min(0).int().optional(),
        flavors: z.array(flavorSchema).optional(),
        active: z.boolean().optional(),
    })
    .superRefine((data, ctx) => {
        if (data.inventoryType === 'stock' && data.stock === undefined) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: 'stock es requerido cuando inventoryType es "stock"',
                path: ['stock'],
            })
        }
    })
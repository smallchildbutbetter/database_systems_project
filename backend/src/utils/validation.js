import { z } from 'zod';

export const productSchema = z.object({
  name: z.string().min(1).max(100),
  size: z.string().max(20).optional(),
  cost: z.number().nonnegative().optional(),
  price: z.number().nonnegative().optional(),
  category_id: z.number().int().positive().optional(),
});

export const employeeSchema = z.object({
  name: z.string().min(1).max(100),
  role: z.string().max(50).optional(),
  wage: z.number().nonnegative().optional(),
});

const saleItemSchema = z.object({
  product_id: z.number().int().positive(),
  qty: z.number().int().positive().default(1),
  unit_price: z.number().nonnegative().optional(),
});

export const saleSchema = z.object({
  sale_date: z.string().datetime().optional(),
  store_id: z.number().int().positive(),
  emp_id: z.number().int().positive().optional(),
  customer_id: z.number().int().positive().nullable().optional(),
  payment_method: z.string().max(20).optional(),
  items: z.array(saleItemSchema).min(1),
});


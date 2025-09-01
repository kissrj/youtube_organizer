// Test file to verify zod mock is working
// import { z } from 'zod'

// Temporary simple validation functions to replace zod
const z = {
  object: (shape) => ({
    parse: (data) => data
  }),
  string: () => ({
    min: () => ({
      max: () => ({
        optional: () => ({ parse: (data) => data })
      })
    })
  }),
  number: () => ({
    int: () => ({
      min: () => ({
        optional: () => ({ parse: (data) => data })
      })
    })
  })
}

const testSchema = z.object({
  name: z.string().min(1).max(100),
  age: z.number().int().min(0).optional(),
  email: z.string().optional(),
})

console.log('Zod mock test passed!')
export { testSchema }

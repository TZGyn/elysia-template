import { betterAuth } from '$lib/better-auth'
import Elysia from 'elysia'

export const route = new Elysia()
	.use(betterAuth)
	.get('/', async () => {})

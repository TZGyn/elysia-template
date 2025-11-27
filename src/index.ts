import openapi from '@elysiajs/openapi'
import { cors } from '@elysiajs/cors'
import { Elysia } from 'elysia'
import { logger } from '$lib/logger'
import { auth } from '$lib/auth'

export const createApp = () =>
	new Elysia()
		.use(
			cors({
				origin: [Bun.env.APP_URL!],
				methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
				credentials: true,
				allowedHeaders: ['Content-Type', 'Authorization'],
			}),
		)
		.use(
			openapi({
				path: '/docs',
			}),
		)
		.mount(auth.handler)
		.use(logger())

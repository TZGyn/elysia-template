import openapi from '@elysiajs/openapi'
import { cors } from '@elysiajs/cors'
import { Elysia } from 'elysia'
import { logger } from '$lib/logger'
import { auth } from '$lib/auth'

import { OpenAPI } from './better-auth-openapi'

const components = await OpenAPI.components
const paths = await OpenAPI.getPaths()

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
				documentation: {
					components: components,
					paths: paths,
				},
			}),
		)
		.mount(auth.handler)
		.use(logger())

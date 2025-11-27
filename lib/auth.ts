import { betterAuth } from 'better-auth'
import { drizzleAdapter } from 'better-auth/adapters/drizzle'
import { db } from './db'
import * as schema from './db/schema'

export const auth = betterAuth({
	baseURL: Bun.env.API_URL,
	trustedOrigins: [Bun.env.APP_URL!],
	basePath: '/auth',
	secret: Bun.env.BETTER_AUTH_SECRET,
	database: drizzleAdapter(db, {
		provider: 'pg',
		schema: schema,
	}),
	socialProviders: {
		google: {
			prompt: 'select_account consent',
			enabled: true,
			clientId: Bun.env.GOOGLE_OAUTH_CLIENT_ID!,
			clientSecret: Bun.env.GOOGLE_OAUTH_CLIENT_SECRET!,
			scope: [
				'https://www.googleapis.com/auth/userinfo.profile',
				'https://www.googleapis.com/auth/userinfo.email',
			],
		},
	},
	user: {
		changeEmail: {
			enabled: true,
		},
		deleteUser: {
			enabled: true,
		},
	},
	telemetry: {
		enabled: false,
	},
	plugins: [],
})

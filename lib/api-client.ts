// client.ts
import { treaty } from '@elysiajs/eden'
import { Route } from '$routes/route-types'

export type Client = ReturnType<typeof treaty<Route>>

export const makeClient = (url: string): Client => {
	const client = treaty<Route>(url, {
		fetch: {
			credentials: 'include',
		},
	})

	return client
}

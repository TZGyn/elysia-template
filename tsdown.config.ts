import { defineConfig } from 'tsdown'

export default defineConfig([
	{
		entry: ['./lib/api-client.ts'],
		platform: 'node',
		clean: false,
		dts: true,
		ignoreWatch: ['./.turbo', './src/routes'],
	},
])

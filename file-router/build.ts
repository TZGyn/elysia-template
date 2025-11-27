import fs from 'node:fs'
import { BunPlugin } from 'bun'
import path from 'node:path'

export function globSync(
	globPattern: string,
	globOptions: { cwd?: string },
) {
	return Array.from(new Bun.Glob(globPattern).scanSync(globOptions))
}

const fsUsageMock = /* ts */ `{
    default: {
        existsSync() {
            return true;
        },
        statSync() {
            return {
                isDirectory() {
                    return true;
                }
            }
        }
    }
}`

const fileSourcesString = (files: string[], directory: string) => `
	const fileSources = {
		${files
			.map(
				(file) => /* ts */ `
		"${file.replaceAll('\\', '/')}": await import("${path
					.resolve(directory, file)
					.replace(/\\/gi, '\\\\')}"),`,
			)
			.join('\n')}
	}
`

const filerouter = () => {
	return {
		name: 'file-router',
		setup: (build) => {
			const directory = './src/routes'

			build.onLoad(
				{ filter: /(.*)file-router(\/|\\)(.*).(ts)/i },
				async (args) => {
					const pattern = '**/*.{ts,tsx,js,jsx,mjs,cjs}'
					let content = String(await fs.promises.readFile(args.path))

					const files = globSync(pattern, { cwd: directory })

					content = content.replace('watch()', '')
					content = content.replace(
						'delete require.cache[require.resolve(pathToFileURL(fullPath).href)]',
						'',
					)

					content = content.replace(
						'const files = globSync(globPattern, globOptions)',
						/* ts */ `const files = [${files
							.map((file) => `"${file.replaceAll('\\', '/')}"`)
							.join(',')}];`,
					)

					content = content.replace(
						`import fs from 'node:fs'`,
						`var { default: fs} = ${fsUsageMock}`,
					)

					content = content.replace(
						'// insert imports',
						fileSourcesString(files, directory),
					)

					content = content.replace(
						/const file = (.*)/i,
						'const file = fileSources[filepath]',
					)

					await Bun.write('test.ts', content)

					return { contents: content }
				},
			)
		},
	} satisfies BunPlugin
}

await Bun.build({
	entrypoints: ['file-router/index.ts'],
	target: 'bun',
	outdir: 'build',
	sourcemap: true,
	plugins: [filerouter()],
	compile: true,
}).then(console.log)

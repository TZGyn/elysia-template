import {
	Elysia,
	ElysiaCustomStatusResponse,
	InvertedStatusMap,
} from 'elysia'

const colorStatus = (status?: number | string) => {
	if (!status) return status

	if (typeof status === 'string') return status
	//   const colorEnabled = await getColorEnabledAsync()
	switch ((status / 100) | 0) {
		case 5: // red = error
			return `\x1b[31m${status}\x1b[0m`
		case 4: // yellow = warning
			return `\x1b[33m${status}\x1b[0m`
		case 3: // cyan = redirect
			return `\x1b[36m${status}\x1b[0m`
		case 2: // green = success
			return `\x1b[32m${status}\x1b[0m`
	}
	// Fallback to unsupported status code.
	// E.g.) Bun and Deno supports new Response with 101, but Node.js does not.
	// And those may evolve to accept more status.
	return `${status}`
}

const colorTime = (time: number, output: string) => {
	if (time <= 100) {
		return `\x1b[32m${output}\x1b[0m`
	} else if (time <= 300) {
		return `\x1b[33m${output}\x1b[0m`
	} else {
		return `\x1b[31m${output}\x1b[0m`
	}
}

const humanize = (times: string[]) => {
	const [delimiter, separator] = [',', '.']

	const orderTimes = times.map((v) =>
		v.replace(/(\d)(?=(\d\d\d)+(?!\d))/g, '$1' + delimiter),
	)

	return orderTimes.join(separator)
}

const time = (start: number) => {
	const delta = Date.now() - start
	return colorTime(
		delta,
		humanize([
			delta < 1000 ? delta + 'ms' : Math.round(delta / 1000) + 's',
		]),
	)
}

export const logger = ({
	methods = ['GET', 'PUT', 'POST', 'DELETE'],
} = {}) =>
	new Elysia()
		.derive({ as: 'global' }, () => ({ start: Date.now() }))
		.onBeforeHandle({ as: 'global' }, (ctx) => {
			if (!methods.includes(ctx.request.method)) return
			console.log('-->', ctx.request.method, ctx.path)
		})
		.onAfterHandle({ as: 'global' }, (ctx) => {
			if (!methods.includes(ctx.request.method)) return
			const response =
				ctx.responseValue as ElysiaCustomStatusResponse<
					keyof InvertedStatusMap,
					any
				>
			console.log(
				'<--',
				ctx.request.method,
				ctx.path,
				colorStatus(response?.code || ctx.set.status),
				`(${time(ctx.start)})`,
			)
		})
		.onError({ as: 'global' }, (ctx) => {
			if (!methods.includes(ctx.request.method)) return
			console.log(
				'-->',
				ctx.request.method,
				ctx.path,
				ctx.set.status,
				'in',
				ctx.start ? Date.now() - ctx.start : Number.NaN,
				'ms',
			)
		})

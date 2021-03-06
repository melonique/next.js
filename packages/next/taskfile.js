const notifier = require('node-notifier')
const relative = require('path').relative

// eslint-disable-next-line camelcase
export async function ncc_arg(task, opts) {
  await task
    .source(opts.src || relative(__dirname, require.resolve('arg')))
    .ncc({ packageName: 'arg' })
    .target('dist/compiled/arg')
}

// eslint-disable-next-line camelcase
export async function ncc_resolve(task, opts) {
  await task
    .source(opts.src || relative(__dirname, require.resolve('resolve')))
    .ncc({ packageName: 'resolve' })
    .target('dist/compiled/resolve')
}

// eslint-disable-next-line camelcase
export async function ncc_nanoid(task, opts) {
  await task
    .source(opts.src || relative(__dirname, require.resolve('nanoid')))
    .ncc({ packageName: 'nanoid' })
    .target('dist/compiled/nanoid')
}

// eslint-disable-next-line camelcase
export async function ncc_unistore(task, opts) {
  await task
    .source(opts.src || relative(__dirname, require.resolve('unistore')))
    .ncc({ packageName: 'unistore' })
    .target('dist/compiled/unistore')
}

// eslint-disable-next-line camelcase
export async function ncc_text_table(task, opts) {
  await task
    .source(opts.src || relative(__dirname, require.resolve('text-table')))
    .ncc({ packageName: 'text-table' })
    .target('dist/compiled/text-table')
}

export async function precompile(task) {
  await task.parallel([
    'ncc_unistore',
    'ncc_resolve',
    'ncc_arg',
    'ncc_nanoid',
    'ncc_text_table',
  ])
}

export async function compile(task) {
  await task.parallel([
    'cli',
    'bin',
    'server',
    'nextbuild',
    'nextbuildstatic',
    'pages',
    'lib',
    'client',
    'telemetry',
    'nextserverserver',
    'nextserverlib',
  ])
}

export async function bin(task, opts) {
  await task
    .source(opts.src || 'bin/*')
    .babel('server', { stripExtension: true })
    .target('dist/bin', { mode: '0755' })
  notify('Compiled binaries')
}

export async function cli(task, opts) {
  await task
    .source(opts.src || 'cli/**/*.+(js|ts|tsx)')
    .babel('server')
    .target('dist/cli')
  notify('Compiled cli files')
}

export async function lib(task, opts) {
  await task
    .source(opts.src || 'lib/**/*.+(js|ts|tsx)')
    .babel('server')
    .target('dist/lib')
  notify('Compiled lib files')
}

export async function server(task, opts) {
  await task
    .source(opts.src || 'server/**/*.+(js|ts|tsx)')
    .babel('server')
    .target('dist/server')
  notify('Compiled server files')
}

export async function nextbuild(task, opts) {
  await task
    .source(opts.src || 'build/**/*.+(js|ts|tsx)')
    .babel('server')
    .target('dist/build')
  notify('Compiled build files')
}

export async function client(task, opts) {
  await task
    .source(opts.src || 'client/**/*.+(js|ts|tsx)')
    .babel('client')
    .target('dist/client')
  notify('Compiled client files')
}

// export is a reserved keyword for functions
export async function nextbuildstatic(task, opts) {
  await task
    .source(opts.src || 'export/**/*.+(js|ts|tsx)')
    .babel('server')
    .target('dist/export')
  notify('Compiled export files')
}

export async function pages_app(task) {
  await task
    .source('pages/_app.tsx')
    .babel('client')
    .target('dist/pages')
}

export async function pages_error(task) {
  await task
    .source('pages/_error.tsx')
    .babel('client')
    .target('dist/pages')
}

export async function pages_document(task) {
  await task
    .source('pages/_document.tsx')
    .babel('server')
    .target('dist/pages')
}

export async function pages(task, opts) {
  await task.parallel(['pages_app', 'pages_error', 'pages_document'])
}

export async function telemetry(task, opts) {
  await task
    .source(opts.src || 'telemetry/**/*.+(js|ts|tsx)')
    .babel('server')
    .target('dist/telemetry')
  notify('Compiled telemetry files')
}

export async function build(task) {
  await task.serial(['precompile', 'compile'])
}

export default async function(task) {
  await task.clear('dist')
  await task.start('build')
  await task.watch('bin/*', 'bin')
  await task.watch('pages/**/*.+(js|ts|tsx)', 'pages')
  await task.watch('server/**/*.+(js|ts|tsx)', 'server')
  await task.watch('build/**/*.+(js|ts|tsx)', 'nextbuild')
  await task.watch('export/**/*.+(js|ts|tsx)', 'nextbuildstatic')
  await task.watch('client/**/*.+(js|ts|tsx)', 'client')
  await task.watch('lib/**/*.+(js|ts|tsx)', 'lib')
  await task.watch('cli/**/*.+(js|ts|tsx)', 'cli')
  await task.watch('telemetry/**/*.+(js|ts|tsx)', 'telemetry')
  await task.watch('next-server/server/**/*.+(js|ts|tsx)', 'nextserverserver')
  await task.watch('next-server/lib/**/*.+(js|ts|tsx)', 'nextserverlib')
}

export async function nextserverlib(task, opts) {
  await task
    .source(opts.src || 'next-server/lib/**/*.+(js|ts|tsx)')
    .typescript({ module: 'commonjs' })
    .target('dist/next-server/lib')
  notify('Compiled lib files')
}

export async function nextserverserver(task, opts) {
  await task
    .source(opts.src || 'next-server/server/**/*.+(js|ts|tsx)')
    .typescript({ module: 'commonjs' })
    .target('dist/next-server/server')
  notify('Compiled server files')
}

export async function nextserverbuild(task) {
  await task.parallel(['nextserverserver', 'nextserverlib'])
}

export async function release(task) {
  await task.clear('dist').start('build')
  await task.clear('dist/next-server').start('nextserverbuild')
}

// notification helper
function notify(msg) {
  return notifier.notify({
    title: '▲ Next',
    message: msg,
    icon: false,
  })
}

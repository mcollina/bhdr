'use strict'

const t = require('tap')
const split = require('split2')
const path = require('path')
const childProcess = require('child_process')
const chalk = require('chalk')

const args = [
  path.join(__dirname, '../bin.js'),
  path.join(__dirname, 'benchmarks')
]

const child = childProcess.spawn(process.execPath, args, {
  cwd: path.join(__dirname),
  env: process.env,
  stdio: ['ignore', 'pipe', 'pipe'],
  detached: false
})

t.tearDown(() => {
  child.kill()
})

const lines = [
  '--> benchmarks/benchA.js',
  'a: ',
  'b: ',
  'a: ',
  'b: ',
  '',
  '--> benchmarks/benchB.js',
  'a: ',
  'b: ',
  'a: ',
  'b: '
]

t.plan(lines.length)

child.stderr.pipe(process.stderr)

child
  .stdout
  .pipe(split())
  .on('data', (line) => {
    t.ok(chalk.stripColor(line).indexOf(lines.shift()) >= 0, 'there is a prefix')
  })

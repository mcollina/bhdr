'use strict'

const t = require('tap')
const split = require('split2')
const path = require('path')
const childProcess = require('child_process')
const chalk = require('chalk')

const args = [
  path.join(__dirname, '../bin.js'),
  'compare',
  path.join(__dirname, 'benchmarks', 'results')
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
  'BENCH BENCHMARKS/BENCHA.JS BENCHMARKS/BENCHB.JS DIFFERENCE SIGNIFICANT',
  /a +[\d.]+ ops\/s ±[\d.]+% +[\d.]+ ops\/s ±[\d.]+% +[-\d.]+% +\*+/,
  /b +[\d.]+ ops\/s ±[\d.]+% +[\d.]+ ops\/s ±[\d.]+% +[-\d+.]+% +\*+/
]

t.plan(lines.length)

child.stderr.pipe(process.stderr)

child
  .stdout
  .pipe(split())
  .on('data', (line) => {
    const expected = lines.shift()
    if (typeof expected === 'string') {
      t.ok(chalk.stripColor(line).indexOf(expected) >= 0, 'there is a prefix')
    } else {
      t.ok(expected.test(line))
    }
  })

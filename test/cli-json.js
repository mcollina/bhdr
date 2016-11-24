'use strict'

const t = require('tap')
const split = require('split2')
const path = require('path')
const childProcess = require('child_process')
const fs = require('fs')
const os = require('os')
const file = path.join(os.tmpdir(), 'out.json')
const chalk = require('chalk')

const lines = [
  '--> benchmarks/benchA.js',
  'aA: ',
  'aB: ',
  'aA: ',
  'aB: ',
  '',
  '--> benchmarks/benchB.js',
  'bA: ',
  'bB: ',
  'bA: ',
  'bB: '
]

t.plan(8 + lines.length)

try {
  fs.unlinkSync(file)
  t.pass('cleaned correctly')
} catch (err) {
  t.ok(err, 'no file to clean')
}

const args = [
  path.join(__dirname, '../bin.js'),
  '--out',
  file,
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

child.stderr.pipe(process.stderr)

child
  .stdout
  .pipe(split())
  .on('data', (line) => {
    t.ok(chalk.stripColor(line).indexOf(lines.shift()) >= 0, 'there is a prefix')
  })

child.on('exit', function () {
  fs.readFile(file, function (err, data) {
    t.error(err)

    data = JSON.parse(data)

    t.ok(data['benchmarks/benchA.js'], 'key for file')
    t.ok(data['benchmarks/benchA.js']['aA'], 'key for bench aA')
    t.ok(data['benchmarks/benchA.js']['aB'], 'key for bench aB')
    t.ok(data['benchmarks/benchB.js'], 'key as bench')
    t.ok(data['benchmarks/benchB.js']['bA'], 'key for bench bA')
    t.ok(data['benchmarks/benchB.js']['bB'], 'key for bench bB')
  })
})

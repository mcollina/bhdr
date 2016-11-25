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

t.plan(18 + lines.length)

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

    t.ok(Array.isArray(data))
    t.equal(data.length, 2, '2 elements')
    t.equal(data[0].name, 'benchmarks/benchA.js', 'key for file')
    t.equal(data[1].name, 'benchmarks/benchB.js', 'key for file')
    t.ok(Array.isArray(data[0].experiments), 'experiments')
    t.ok(Array.isArray(data[1].experiments), 'experiments')
    t.equal(data[0].experiments.length, 4, '2 elements in experiments')
    t.equal(data[1].experiments.length, 4, '2 elements in experiments')
    t.equal(data[0].experiments[0].name, 'a', 'key for the experiment')
    t.equal(data[0].experiments[1].name, 'b', 'key for the experiment')
    t.equal(data[0].experiments[2].name, 'a', 'key for the experiment')
    t.equal(data[0].experiments[3].name, 'b', 'key for the experiment')
    t.equal(data[1].experiments[0].name, 'a', 'key for the experiment')
    t.equal(data[1].experiments[1].name, 'b', 'key for the experiment')
    t.equal(data[1].experiments[2].name, 'a', 'key for the experiment')
    t.equal(data[1].experiments[3].name, 'b', 'key for the experiment')
  })
})

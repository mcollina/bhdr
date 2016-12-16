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

const expected = {
  'benchmarks/benchA.js': [
    'a',
    'b',
    'a',
    'b'
  ],
  'benchmarks/benchB.js': [
    'a',
    'b',
    'a',
    'b'
  ]
}

t.plan(Object.keys(expected).reduce((acc, key) => acc + expected[key].length, 0) * 2 + lines.length + 1)

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
  cwd: __dirname,
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
  fs.createReadStream(file)
    .pipe(split(JSON.parse))
    .on('data', function (exp) {
      t.ok(expected[exp.bench], 'this benchmark exists')
      t.equal(exp.name, expected[exp.bench].shift(), 'name of the function matches')
    })
})

#! /usr/bin/env node

'use strict'

const minimist = require('minimist')
// const split = require('split2')
const fs = require('fs')
const path = require('path')
const glob = require('glob')
const childProcess = require('child_process')
const chalk = require('chalk')

const args = minimist(process.argv.slice(2))

if (args._.length === 0) {
  console.error('Usage: bdhr files..')
  process.exit(1)
}

const files = args._.reduce(add, [])

function add (acc, file) {
  file = path.resolve(file)

  try {
    const stat = fs.statSync(file)
    if (stat.isDirectory()) {
      file = path.join(file, '**/*.js')
      glob.sync(file).reduce(add, acc)
    } else {
      acc.push(file)
    }

    return acc
  } catch (err) {
    console.error(err.message)
    process.exit(1)
  }
}

next(files.shift())

function next (file) {
  console.log(chalk.bold('--> ' + path.relative(process.cwd(), file)))
  const args = [
    file
  ]

  const child = childProcess.spawn(process.execPath, args, {
    cwd: path.join(__dirname),
    env: process.env,
    stdio: ['ignore', 'pipe', 'pipe'],
    detached: false
  })

  child.stderr.pipe(process.stderr)
  child.stdout.pipe(process.stdout)

  child.on('exit', function () {
    const f = files.shift()

    if (f) {
      console.log('')
      next(f)
    }
  })
}

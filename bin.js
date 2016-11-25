#! /usr/bin/env node

'use strict'

const minimist = require('minimist')
const commist = require('commist')()
const split = require('split2')
const fs = require('fs')
const path = require('path')
const glob = require('glob')
const childProcess = require('child_process')
const buildText = require('./lib/text')
const chalk = require('chalk')
const Transform = require('readable-stream').Transform

process.argv.slice(2)

commist.register('run', run)
commist.register('compare', compare)

if (commist.parse(process.argv.slice(2))) {
  run(process.argv.slice(2))
}

function run (argv) {
  const args = minimist(argv)

  if (args._.length === 0) {
    console.error('Usage: bdhr files..')
    process.exit(1)
  }

  var outList = null

  if (args.out) {
    outList = []
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
    const benchName = path.relative(process.cwd(), file)
    console.log(chalk.bold('--> ' + benchName))
    const args = [
      file
    ]

    const env = Object.assign({ BHDR_JSON: true }, process.env)
    const text = buildText({ color: true })

    const child = childProcess.spawn(process.execPath, args, {
      cwd: path.join(__dirname),
      env,
      stdio: ['ignore', 'pipe', 'pipe'],
      detached: false
    })

    child.stderr.pipe(process.stderr)
    const childOut = child.stdout.pipe(split(function (line) {
      try {
        return JSON.parse(line)
      } catch (err) {
        return { err: line }
      }
    }))

    const out = {
      name: benchName,
      experiments: []
    }

    if (outList) {
      outList.push(out)
    }

    childOut.pipe(new Transform({
      objectMode: true,
      transform: function (chunk, enc, cb) {
        out.experiments.push(chunk)
        cb(null, text(chunk) + '\n')
      }
    })).pipe(process.stdout)

    child.on('exit', function () {
      const f = files.shift()

      if (f) {
        console.log('')
        next(f)
        return
      } else {
        write()
      }
    })
  }

  function write () {
    if (!outList) {
      return
    }

    fs.writeFile(args.out, JSON.stringify(outList, null, 2), function (err) {
      if (err) {
        throw err
      }
    })
  }
}

function compare (argv) {
  const args = minimist(argv)
  console.log(args)
}

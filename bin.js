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
const compareData = require('./lib/compare')
const columnify = require('columnify')

process.argv.slice(2)

commist.register('run', run)
commist.register('compare', compare)

if (commist.parse(process.argv.slice(2))) {
  run(process.argv.slice(2))
}

function run (argv) {
  const args = minimist(argv)

  if (args._.length === 0) {
    // TODO better usage
    console.error('Usage: bdhr [run] files..')
    console.error('Usage: bdhr compare old new')
    process.exit(1)
  }

  var outFile = null

  if (args.out) {
    outFile = fs.createWriteStream(args.out)
  }

  const files = args._.reduce(add, [])

  next(files.shift())

  function next (file) {
    const benchName = path.relative(process.cwd(), file)
    console.log(chalk.bold('--> ' + benchName))
    runSingle({ benchName, file }, function (err, out) {
      if (err) {
        // nothing we can do about it
        throw err
      }

      write(out)

      const f = files.shift()

      if (f) {
        console.log('')
        next(f)
      }
    })
  }

  function write (out) {
    if (!outFile) {
      return
    }

    out.experiments.forEach(function (exp) {
      // so that the bench name comes first
      outFile.write(JSON.stringify(exp) + '\n')
    })
  }
}

function runSingle (opts, cb) {
  const benchName = opts.benchName
  const file = opts.file
  const silent = opts.silent
  const args = [
    file
  ]

  const env = Object.assign({ BHDR_JSON: true }, process.env)
  const text = buildText({ color: true })

  const child = childProcess.spawn(process.execPath, args, {
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

  childOut.pipe(new Transform({
    objectMode: true,
    transform: function (chunk, enc, cb) {
      out.experiments.push(chunk)

      if (!silent) {
        cb(null, text(chunk) + '\n')
      } else {
        cb()
      }
    }
  })).on('end', function () {
    cb(null, out)
  })
  .pipe(process.stdout)
}

function compare (argv) {
  const args = minimist(argv)

  switch (args._.length) {
    case 1:
      readFile(args._[0])
      break
    case 2:
      runTwo(args._.reduce(add, []))
      break
    default:
      // TODO better usage
      console.error('Usage: bdhr compare old new')
      process.exit(1)
  }
}

function readFile (file) {
  const benchmarks = {}
  fs.createReadStream(file)
    .pipe(split(function (line) {
      try {
        const data = JSON.parse(line)
        return data
      } catch (err) {
        this.emit('skip', line, err)
        return undefined
      }
    }))
    .on('data', function (exp) {
      const bench = benchmarks[exp.bench] || {
        name: exp.bench,
        experiments: []
      }
      benchmarks[exp.bench] = bench
      bench.experiments.push(exp)
    })
    .on('end', function () {
      const list = Object.keys(benchmarks).map(bench => benchmarks[bench])

      if (list.length !== 2) {
        console.error('You can compare only two benchmarks,', list.length, ' found')
        process.exit(1)
      }

      computeCompare(list[0], list[1])
    })
}

function runTwo (files) {
  const oldBenchName = path.relative(process.cwd(), files[0])
  const newBenchName = path.relative(process.cwd(), files[1])

  runSingle({
    benchName: oldBenchName,
    file: files[0],
    silent: true
  }, function (err, outOld) {
    if (err) {
      throw err
    }

    runSingle({
      benchName: newBenchName,
      file: files[1],
      silent: true
    }, function (err, outNew) {
      if (err) {
        throw err
      }

      computeCompare(outOld, outNew)
    })
  })
}

function computeCompare (outOld, outNew) {
  const stat = compareData(outOld, outNew)

  const text = buildText({ color: false, prefix: false })

  const data = Object.keys(stat).reduce(function (res, key) {
    const obj = {}

    obj.bench = key
    obj[outOld.name] = text(stat[key].old)
    obj[outNew.name] = text(stat[key].new)

    const color = stat[key].difference.indexOf('-') === 0 ? chalk.red : chalk.green

    obj.difference = color(stat[key].difference)
    obj.significant = chalk.bold(stat[key].significant)

    res.push(obj)
    return res
  }, [])

  console.log(columnify(data))
}

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


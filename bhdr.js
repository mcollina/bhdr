'use strict'

const Histogram = require('native-hdr-histogram')
const histutils = require('hdr-histogram-percentiles-obj')
const console = require('console') // for proxyquire in tests
const process = require('process') // for proxyquire in tests
const buildText = require('./lib/text')
const path = require('path')

function build (funcs, opts) {
  var maxRuns

  if (!Array.isArray(funcs)) {
    funcs = [funcs]
  }

  if (typeof opts === 'object') {
    maxRuns = opts.max || opts.iterations
  } else {
    maxRuns = opts
    opts = {}
  }

  const benchName = path.relative(process.cwd(), process.argv[1])
  const text = buildText(opts)

  return run

  function run (done) {
    done = done || noop
    var results = []
    var toExecs = [].concat(funcs)
    var print = noop

    if (done.length < 2) {
      print = process.env.BHDR_JSON ? jsonPrint : consolePrint
    }

    var start = process.hrtime()
    runFunc()

    function runFunc () {
      const histogram = new Histogram(1, 1000000000, 5)
      var runs = 0
      var errors = 0
      var func = toExecs.shift()

      if (!func) {
        done(null, {
          results,
          totalTime: asUs(process.hrtime(start))
        })
        return
      }

      var time = process.hrtime()
      func(next)

      function next (err) {
        time = process.hrtime(time)
        const us = asUs(time)
        histogram.record(us)

        if (err) {
          errors++
        }

        if (++runs < maxRuns) {
          time = process.hrtime()
          func(next)
        } else {
          const res = buildResult(histogram, func, errors, runs)
          print(res)
          results.push(res)
          runFunc()
        }
      }
    }

    function buildResult (histogram, func, errors, runs) {
      const result = histutils.histAsObj(histogram)
      result.runs = maxRuns - (maxRuns - runs)
      result.errors = errors
      histutils.addPercentiles(histogram, result)

      // to place the name at the top of the object
      return Object.assign({ name: func.name }, result)
    }

    function consolePrint (result) {
      return console.log(text(result))
    }

    function jsonPrint (result) {
      result = Object.assign({ bench: benchName }, result)
      console.log(JSON.stringify(result))
    }
  }
}

function asUs (time) {
  return time[0] * 1e6 + time[1] / 1e3
}

function noop () {}

module.exports = build

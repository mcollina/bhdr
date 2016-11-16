'use strict'

const Histogram = require('native-hdr-histogram')
const histutils = require('hdr-histogram-percentiles-obj')
const chalk = require('chalk')
const colors = ['red', 'green', 'yellow', 'blue', 'magenta', 'cyan', 'white', 'gray']
const console = require('console') // for proxyquire in tests
const process = require('process') // for proxyquire in tests

function build (funcs, maxRuns) {
  if (!Array.isArray(funcs)) {
    funcs = [funcs]
  }

  return run

  function run (done) {
    done = done || noop
    var results = []
    var toExecs = [].concat(funcs)
    var currentColor = 0
    var print = noop

    if (done.length < 2) {
      print = process.env.BHDR_JSON ? jsonPrint : consolePrint
    }

    runFunc()

    function runFunc () {
      const histogram = new Histogram(1, 1000000, 5)
      var runs = 0
      var errors = 0
      var func = toExecs.shift()

      if (!func) {
        done(null, {
          results,
          totalTime: asMs(process.hrtime(start))
        })
        return
      }

      var time = process.hrtime()
      var start = process.hrtime()
      func(next)

      function next (err) {
        time = process.hrtime(time)
        const ms = asMs(time)
        histogram.record(ms)

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
      result.name = func.name
      result.runs = maxRuns - (maxRuns - runs)
      result.errors = errors
      histutils.addPercentiles(histogram, result)

      return result
    }

    function nextColor () {
      if (currentColor === colors.length) {
        currentColor = 0
      }
      return colors[currentColor++]
    }

    function consolePrint (result) {
      const color = nextColor()
      if (result.errors) {
        console.log(chalk.bold(chalk[color](result.name + ': ' + result.errors + ' errors')))
      } else if (result.mean === 0) {
        console.log(chalk[color](result.name + ': too fast to measure'))
      } else {
        console.log(chalk[color](result.name + ': ' + result.mean + ' ops/ms +-' + result.stddev))
      }
    }

    function jsonPrint (result) {
      console.log(JSON.stringify(result))
    }
  }
}

function asMs (time) {
  return time[0] * 1e3 + time[1] / 1e6
}

function noop () {}

module.exports = build

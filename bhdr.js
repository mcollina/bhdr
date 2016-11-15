'use strict'

const Histogram = require('native-hdr-histogram')
const histutils = require('hdr-histogram-percentiles-obj')

function build (funcs, maxRuns) {
  if (!Array.isArray(funcs)) {
    funcs = [funcs]
  }

  return run

  function run (done) {
    var results = []
    var toExecs = [].concat(funcs)

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
          results.push(buildResult(histogram, func, errors, runs))
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
  }
}

function asMs (time) {
  return time[0] * 1e3 + time[1] / 1e6
}

module.exports = build

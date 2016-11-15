'use strict'

const Histogram = require('native-hdr-histogram')
const histutils = require('hdr-histogram-percentiles-obj')

function build (func, maxRuns) {
  return run

  function run (done) {
    const histogram = new Histogram(1, 1000000, 1)
    var time = process.hrtime()
    var runs = 0
    var errors = 0

    func(next)

    function next (err) {
      const end = process.hrtime(time)
      const ms = end[0] * 1e3 + end[1] / 1e6
      histogram.record(ms)

      errors++

      if (++runs < maxRuns) {
        time = process.hrtime()
        func(next)
      } else {
        done(null, buildResult())
      }
    }

    function buildResult () {
      const result = histutils.histAsObj(histogram)
      result.name = func.name
      result.runs = maxRuns - (maxRuns - runs)
      result.errors = errors
      histutils.addPercentiles(histogram, result)

      return result
    }
  }
}

module.exports = build

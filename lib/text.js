'use strict'

const chalk = require('chalk')
const colors = require('./colors')

function build (opts) {
  opts = opts || {}
  opts.prefix = opts.prefix === undefined

  const ctx = new chalk.constructor({
    enabled: opts.color !== false
  })

  const nextColor = colors()

  return sumText

  function sumText (result) {
    const color = nextColor()
    if (result.errors) {
      return ctx.bold(chalk[color](result.name + ': ' + result.errors + ' errors'))
    } else if (result.mean === 0) {
      return ctx[color](result.name + ': too fast to measure')
    } else {
      const opsPerS = Math.round(1e6 / result.mean) // as second

      // 95% confidence interval
      const interval = 1.959964 * result.stddev / Math.sqrt(result.runs)

      // TODO maybe this is not the right way of calculating it
      const percent = interval / result.mean * 100

      const prefix = opts.prefix ? result.name + ': ' : ''

      return ctx[color](prefix + round(opsPerS) + ' ops/s ±' + round(percent) + '%')
    }
  }
}

function round (num) {
  return Math.round(num * 1e2) / 1e2
}

module.exports = build

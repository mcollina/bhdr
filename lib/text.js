'use strict'

const chalk = require('chalk')
const colors = require('./colors')

function build (opts) {
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
      return ctx[color](result.name + ': ' + result.mean + ' ops/ms +-' + result.stddev)
    }
  }
}

module.exports = build

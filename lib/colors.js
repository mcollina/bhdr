'use strict'

const colors = ['red', 'green', 'yellow', 'blue', 'magenta', 'cyan', 'white', 'gray']

function build () {
  var currentColor = 0

  return nextColor

  function nextColor () {
    if (currentColor === colors.length) {
      currentColor = 0
    }
    return colors[currentColor++]
  }
}

module.exports = build

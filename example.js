'use strict'

var bench = require('./')

var run = bench([
  function benchSetTimeout (done) {
    setTimeout(done, 0)
  },
  function benchSetImmediate (done) {
    setImmediate(done)
  },
  function benchNextTick (done) {
    process.nextTick(done)
  }
], 1000)

run(function () {
  run(function (err, result) {
    if (err) {
      console.log(err)
    } else {
      console.log(JSON.stringify(result, null, 2))
    }
  })
})

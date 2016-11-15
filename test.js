'use strict'

const test = require('tap').test
const build = require('.')

var loopCalled = 0
function loop (done) {
  loopCalled++
  for (var i = 0; i < 1000000; i++) {}
  process.nextTick(done)
}

test('get basic data', function (t) {
  const run = build(loop, 100)

  run(function (err, result) {
    t.error(err)
    t.equal(loopCalled, 100, 'func called num times')
    t.equal(result.name, 'loop', 'name is set')
    t.equal(result.runs, 100, 'runs are set')
    t.equal(result.errors, 0, 'no errors')
    t.ok(result.average, 'average exists')
    t.ok(result.stddev, 'stddev exists')
    t.ok(result.min >= 0, 'min exists')
    t.ok(result.max, 'max exists')
    t.end()
  })
})

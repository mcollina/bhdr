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

  run(function (err, data) {
    var result = data.results
    t.error(err)
    t.ok(data.totalTime, 'there is a total time')
    t.equal(result.length, 1, 'number of result')
    t.equal(loopCalled, 100, 'func called num times')
    t.equal(result[0].name, 'loop', 'name is set')
    t.equal(result[0].runs, 100, 'runs are set')
    t.equal(result[0].errors, 0, 'no errors')
    t.ok(result[0].average, 'average exists')
    t.ok(result[0].stddev, 'stddev exists')
    t.ok(result[0].min >= 0, 'min exists')
    t.ok(result[0].max, 'max exists')
    t.end()
  })
})

test('array support', function (t) {
  const run = build([
    loop,
    function loop2 (done) {
      for (var i = 0; i < 1000000; i++) {}
      process.nextTick(done)
    }
  ], 100)

  run(function (err, data) {
    t.error(err)
    t.ok(data.totalTime, 'there is a total time')
    var result = data.results
    t.equal(result.length, 2, 'number of result')
    t.equal(result[0].name, 'loop', 'name is set')
    t.equal(result[1].name, 'loop2', 'name is set')
    for (var i = 0; i < result.length; i++) {
      t.equal(result[i].runs, 100, 'runs are set')
      t.equal(result[i].errors, 0, 'no errors')
      t.ok(result[i].average, 'average exists')
      t.ok(result[i].stddev, 'stddev exists')
      t.ok(result[i].min >= 0, 'min exists')
      t.ok(result[i].max, 'max exists')
    }
    t.end()
  })
})

// test('has color', function (t) {
//   var chalkEnabled = chalk.enabled
//   chalk.enabled = true
//
//   var bench = proxyquire('./', {
//     console: {
//       log: function (key) {
//         t.ok(chalk.hasColor(key), 'has color')
//       }
//     }
//   })
//
//   t.plan(2)
//
//   var run = bench([
//     loop
//   ], { iterations: 42 })
//
//   run(function () {
//     chalk.enabled = chalkEnabled
//   })
// })

'use strict'

const test = require('tap').test
const chalk = require('chalk')
const proxyquire = require('proxyquire')
const build = require('..')

var loopCalled = 0
function loop (done) {
  loopCalled++
  for (var i = 0; i < 1000000; i++) {}
  process.nextTick(done)
}

test('get basic data', function (t) {
  const run = build(loop, 1000)

  run(function (err, data) {
    var result = data.results
    t.error(err)
    t.ok(data.totalTime, 'there is a total time')
    t.equal(result.length, 1, 'number of result')
    t.equal(loopCalled, 1000, 'func called num times')
    t.equal(result[0].name, 'loop', 'name is set')
    t.equal(result[0].runs, 1000, 'runs are set')
    t.equal(result[0].errors, 0, 'no errors')
    t.ok(result[0].average >= 0, 'average exists')
    t.ok(result[0].stddev >= 0, 'stddev exists')
    t.ok(result[0].min >= 0, 'min exists')
    t.ok(result[0].max >= 0, 'max exists')
    t.end()
  })
})

test('get basic data with options.iterations', function (t) {
  const run = build(loop, { iterations: 100 })

  run(function (err, data) {
    var result = data.results
    t.error(err)
    t.ok(data.totalTime, 'there is a total time')
    t.equal(result.length, 1, 'number of result')
    t.equal(result[0].name, 'loop', 'name is set')
    t.equal(result[0].runs, 100, 'runs are set')
    t.equal(result[0].errors, 0, 'no errors')
    t.ok(result[0].average >= 0, 'average exists')
    t.ok(result[0].stddev >= 0, 'stddev exists')
    t.ok(result[0].min >= 0, 'min exists')
    t.ok(result[0].max >= 0, 'max exists')
    t.end()
  })
})

test('get basic data with options.max', function (t) {
  const run = build(loop, { max: 100 })

  run(function (err, data) {
    var result = data.results
    t.error(err)
    t.ok(data.totalTime, 'there is a total time')
    t.equal(result.length, 1, 'number of result')
    t.equal(result[0].name, 'loop', 'name is set')
    t.equal(result[0].runs, 100, 'runs are set')
    t.equal(result[0].errors, 0, 'no errors')
    t.ok(result[0].average >= 0, 'average exists')
    t.ok(result[0].stddev >= 0, 'stddev exists')
    t.ok(result[0].min >= 0, 'min exists')
    t.ok(result[0].max >= 0, 'max exists')
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
  ], 1000)

  run(function (err, data) {
    t.error(err)
    t.ok(data.totalTime, 'there is a total time')
    var result = data.results
    t.equal(result.length, 2, 'number of result')
    t.equal(result[0].name, 'loop', 'name is set')
    t.equal(result[1].name, 'loop2', 'name is set')
    for (var i = 0; i < result.length; i++) {
      t.equal(result[i].runs, 1000, 'runs are set')
      t.equal(result[i].errors, 0, 'no errors')
      t.ok(result[i].average >= 0, 'average exists')
      t.ok(result[i].stddev >= 0, 'stddev exists')
      t.ok(result[i].min >= 0, 'min exists')
      t.ok(result[i].max >= 0, 'max exists')
    }
    t.end()
  })
})

test('writes to stdout with color if not callback', function (t) {
  t.plan(1)

  var chalkEnabled = chalk.enabled
  chalk.enabled = true

  var bench = proxyquire('../', {
    console: {
      log: function (key) {
        t.ok(chalk.hasColor(key), 'has color')
      }
    }
  })

  var run = bench([
    loop
  ], 42)

  run(function () {
    chalk.enabled = chalkEnabled
  })
})

test('does not write to stdout if callback with 2 args', function (t) {
  var bench = proxyquire('../', {
    console: {
      log: function () {
        t.fail('no console log')
      }
    }
  })

  var run = bench([
    loop
  ], 42)

  run(function (err, result) {
    t.error(err)
    t.end()
  })
})

test('does write newline delimited JSON if process.env.BHDR_JSON is set', function (t) {
  t.plan(9)

  var bench = proxyquire('../', {
    process: {
      env: {
        BHDR_JSON: 'true'
      }
    },
    console: {
      log: function (str) {
        t.equal(arguments.length, 1)
        t.ok(typeof str === 'string')
        var result = JSON.parse(str)
        t.equal(result.name, 'loop', 'name is set')
        t.equal(result.runs, 1000, 'runs are set')
        t.equal(result.errors, 0, 'no errors')
        t.ok(result.average >= 0, 'average exists')
        t.ok(result.stddev >= 0, 'stddev exists')
        t.ok(result.min >= 0, 'min exists')
        t.ok(result.max >= 0, 'max exists')
      }
    }
  })

  var run = bench([
    loop
  ], 1000)

  run()
})

test('disable color', function (t) {
  t.plan(1)

  var bench = proxyquire('../', {
    console: {
      log: function (key) {
        t.notOk(chalk.hasColor(key), 'has no color')
      }
    }
  })

  var run = bench([
    function first (done) {
      setImmediate(done)
    }
  ], {
    iterations: 42,
    color: false
  })

  run()
})

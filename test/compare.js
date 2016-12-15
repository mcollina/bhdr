'use strict'

const test = require('tap').test
const compare = require('../lib/compare')

test('compare two sets of data', function (t) {
  const result = compare({
    name: 'bench1',
    experiments: [
      { mean: 22.5, stddev: 13, runs: 1000, name: 'a' }
    ]
  }, {
    name: 'bench2',
    experiments: [
      { mean: 22.6, stddev: 0.1, runs: 1000, name: 'a' }
    ]
  })

  t.ok(result.a, 'a exists')
  t.equal(result.a.difference, '-0.44%')
  t.comment(JSON.stringify(result.a))
  t.ok(result.a.pValue > 0, 'greater than zero')
  t.equal(result.a.significant, '')
  t.end()
})

test('compare two sets of data reverse', function (t) {
  const result = compare({
    name: 'bench1',
    experiments: [
      { mean: 22.6, stddev: 0.1, runs: 1000, name: 'a' }
    ]
  }, {
    name: 'bench2',
    experiments: [
      { mean: 22.5, stddev: 13, runs: 1000, name: 'a' }
    ]
  })

  t.ok(result.a, 'a exists')
  t.equal(result.a.difference, '0.44%')
  t.comment(JSON.stringify(result.a))
  t.ok(result.a.pValue > 0, 'greater than zero')
  t.equal(result.a.significant, '')
  t.end()
})

test('compare two sets of data', function (t) {
  const result = compare({
    name: 'bench1',
    experiments: [
      { mean: 22.5, stddev: 13, runs: 1000, name: 'a' }
    ]
  }, {
    name: 'bench2',
    experiments: [
      { mean: 23.6, stddev: 0.1, runs: 1000, name: 'a' }
    ]
  })

  t.ok(result.a, 'a exists')
  t.equal(result.a.difference, '-4.66%')
  t.comment(JSON.stringify(result.a))
  t.ok(result.a.pValue > 0, 'greater than zero')
  t.equal(result.a.significant, '**')
  t.end()
})

test('compare two sets of data with two benches', function (t) {
  const result = compare({
    name: 'bench1',
    experiments: [
      { mean: 22.5, stddev: 13, runs: 1000, name: 'a' },
      { mean: 22.5, stddev: 13, runs: 1000, name: 'b' }
    ]
  }, {
    name: 'bench2',
    experiments: [
      { mean: 22.6, stddev: 0.1, runs: 1000, name: 'a' },
      { mean: 22.5, stddev: 13, runs: 1000, name: 'b' }
    ]
  })

  t.ok(result.a, 'a exists')
  t.equal(result.a.difference, '-0.44%')
  t.comment(JSON.stringify(result.a))
  t.ok(result.a.pValue > 0, 'greater than zero')
  t.equal(result.a.significant, '')

  t.ok(result.b, 'b exists')
  t.equal(result.b.difference, '0%')
  t.comment(JSON.stringify(result.b))
  t.ok(result.b.pValue > 0, 'greater than zero')
  t.equal(result.b.significant, '')

  t.end()
})

'use strict'

const test = require('tap').test
const compare = require('../lib/compare')

test('compare two sets of data', function (t) {
  const result = compare({
    name: 'bench1',
    experiments: [
      { mean: 22.5, stddev: 13, length: 1000, name: 'a' }
    ]
  }, {
    name: 'bench2',
    experiments: [
      { mean: 22.6, stddev: 0.1, length: 1000, name: 'a' }
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
      { mean: 22.6, stddev: 0.1, length: 1000, name: 'a' }
    ]
  }, {
    name: 'bench2',
    experiments: [
      { mean: 22.5, stddev: 13, length: 1000, name: 'a' }
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
      { mean: 22.5, stddev: 13, length: 1000, name: 'a' }
    ]
  }, {
    name: 'bench2',
    experiments: [
      { mean: 23.6, stddev: 0.1, length: 1000, name: 'a' }
    ]
  })

  t.ok(result.a, 'a exists')
  t.equal(result.a.difference, '-4.66%')
  t.comment(JSON.stringify(result.a))
  t.ok(result.a.pValue > 0, 'greater than zero')
  t.equal(result.a.significant, '**')
  t.end()
})

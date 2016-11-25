'use strict'

const ttest = require('ttest')

function compare (a, b) {
  const stats = a.experiments.reduce(function (res, exp1) {
    const exp2 = b.experiments.reduce(function (acc, exp) {
      return exp.name === exp1.name ? exp : acc
    }, null)

    if (!exp2) {
      return res
    }

    const stat = ttest(asData(exp1), asData(exp2))

    const difference = (Math.round((exp1.mean - exp2.mean) / exp2.mean * 100 * 100, 2) / 100) + '%'

    res[exp1.name] = {
      difference,
      pValue: stat.pValue(),
      significant: asSignificant(stat.pValue())
    }

    return res
  }, {})

  return stats
}

function asData (obj) {
  const res = {
    mean: obj.mean,
    variance: Math.pow(obj.stddev, 2),
    size: obj.length
  }
  return res
}

function asSignificant (value) {
  var significant = ''

  if (value < 0.001) {
    significant = '***'
  } else if (value < 0.01) {
    significant = '**'
  } else if (value < 0.05) {
    significant = '*'
  }

  return significant
}

module.exports = compare

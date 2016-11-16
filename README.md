# bhdr

Benchmark utility powered by [hdr
histograms](https://github.com/mcollina/native-hdr-histogram), for node.

It is API-compatible with [fastbench](https://github.com/mcollina/fastbench).

## Install

```js
npm install bhdr
```

## Usage

```js
'use strict'

var bench = require('fastbench')

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

// run them two times
run(run)
```

Output

```
$ node example.js
benchSetTimeout: 1 ops/ms +-0.16
benchSetImmediate: too fast to measure
benchNextTick: too fast to measure
benchSetTimeout: 1 ops/ms +-0.11
benchSetImmediate: too fast to measure
benchNextTick: too fast to measure
```

You can disable colors by passing a `--no-color` flag to your node
script.

## API

### bench(functions, iterations)

Build a benchmark for the given functions and that precise number of
iterations. It returns a function to run the benchmark.

The iterations parameter can also be an `Object`, in which case it
acceps two options:

* `iterations`: the number of iterations (required)
* `max`: is a an alias for iterations
* `color`: if the output should have color (default: true)

## Acknowledgements

This project is kindly sponsored by [nearForm](http://nearform.com).

## License

MIT

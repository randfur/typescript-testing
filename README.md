# typescript-testing

## Demo

https://fortune-lowly-saw.glitch.me/  
Source: https://glitch.com/edit/#!/fortune-lowly-saw

## Example usage

```js
import { runTests, TestSuite } from 'https://randfur.github.io/typescript-testing/testing';

runTests([
  class Dog extends TestSuite {
    testBark() {
      this.assertEqual(1, 1);
    }

    testBork() {
      this.assertEqual(1, 2);
    }

    testBlargb() {
      this.assertEqual('4', 100);
      throw Error('aaaaaaa');
    }
  },
], document.body);
```

## Example output

```
Test results
  Failures (2)
    Dog
      testBork
        Error: Expected "1" to equal "2"
          at Dog.assertEqual (https://randfur.github.io/typescript-testing/testing:8:30)
          at Dog.testBork (https://fortune-lowly-saw.glitch.me/test/dog:7:14)
          at runSuites (https://randfur.github.io/typescript-testing/testing:74:37)
          at async runTests (https://randfur.github.io/typescript-testing/testing:17:5)
      testBlargb
        Error: Expected "4" to equal "100"
            at Dog.assertEqual (https://randfur.github.io/typescript-testing/testing:8:30)
            at Dog.testBlargb (https://fortune-lowly-saw.glitch.me/test/dog:10:14)
            at runSuites (https://randfur.github.io/typescript-testing/testing:74:37)
            at async runTests (https://randfur.github.io/typescript-testing/testing:17:5)
        Error: aaaaaaa
            at Dog.testBlargb (https://fortune-lowly-saw.glitch.me/test/dog:11:15)
            at runSuites (https://randfur.github.io/typescript-testing/testing:74:37)
            at async runTests (https://randfur.github.io/typescript-testing/testing:17:5)
  Passes (1)
    Dog
      testBark
```

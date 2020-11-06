export class TestSuite {
  errors: Error[]

  constructor() {
    this.errors = [];
  }

  tearDown() {}
    
  assertEqual(x: any, y: any) {
    if (x !== y) {
      this.errors.push(Error(`Expected "${x}" to equal "${y}"`));
    }
  }
}

type Passes = Record<string, string[]>;
type Failures = Record<string, Record<string, Error[]>>;

export async function runTests(suites: typeof TestSuite[], container: HTMLElement) {
  addCss();

  const passes: Passes = {};
  const failures: Failures = {};
  
  const scheduleRender = createScheduler(() => render(passes, failures, container));
  await runSuites(suites, passes, failures, scheduleRender);

  logResults(passes, failures);
}

function addCss() {
  const style = document.createElement('style');
  style.textContent = `
.results {
  padding: 20px;
  background-color: black;
  color: white;
  font-family: monospace;
  font-size: 13px;
}
h1 {
  margin-top: 0px;
  color: white;
}
.fail {
  color: red;
}
.pass {
  color: lime;
}
.suite {
  margin-left: 1em;
}
.test {
  margin-left: 2em;
}
.error {
  margin: 0;
  margin-left: 3em;
  color: #999;
}
`;
  document.head.appendChild(style);
}

function createScheduler(task: () => void): () => void {
  let scheduled = false;
  return function scheduleTask() {
    if (!scheduled) {
      scheduled = true;
      requestAnimationFrame(() => {
        scheduled = false;
        task();
      });
    }
  }
}

async function runSuites(suites: typeof TestSuite[], passes: Passes, failures: Failures, scheduleRender: () => void) {
  for (const suite of suites) {
    for (const testName of Object.getOwnPropertyNames(suite.prototype)) {
      if (!testName.startsWith('test')) {
        continue;
      }

      const test = new suite();
      try {
        await (test as any)[testName]();
      } catch (error) {
        test.errors.push(error);
      }
      test.tearDown();

      if (test.errors.length > 0) {
        if (!(suite.name in failures)) {
          failures[suite.name] = {};
        }
        failures[suite.name][testName] = test.errors;
      } else {
        if (!(suite.name in passes)) {
          passes[suite.name] = [];
        }
        passes[suite.name].push(testName);
      }
      scheduleRender();
    }
  }
}

function countPasses(passes: Passes) {
  let count = 0;
  for (const tests of Object.values(passes)) {
    count += tests.length;
  }
  return count;
}

function countFailures(failures: Failures) {
  let count = 0;
  for (const testErrors of Object.values(failures)) {
    count += Object.values(testErrors).length;
  }
  return count;
}

function createElement(tag: string, classNames: string[] | null, text: string | null, children: HTMLElement[] | null): HTMLElement {
  const element = document.createElement(tag);
  if (classNames) {
    for (const className of classNames) {
      element.classList.add(className);
    }
  }
  if (text) {
    element.textContent = text;
  }
  if (children) {
    for (const child of children) {
      element.appendChild(child);
    }
  }
  return element;
}

function render(passes: Passes, failures: Failures, container: HTMLElement) {
  container.textContent = '';
  const results = createElement('div', ['results'], null, [
    createElement('h1', null, 'Test results', null),
    createElement('h2', ['fail'], `Failures (${countFailures(failures)})`, null),
    ...Object.entries(failures).map(([suite, testErrors]) => {
      return createElement('div', ['suite', 'fail'], suite, [
        ...Object.entries(testErrors).map(([test, errors]) => { 
          return createElement('div', ['test'], test, [
            ...errors.map(error => createElement('pre', ['error'], error.stack || null, null)),
          ]);
        }),
      ]);
    }),
    createElement('h2', ['pass'], `Passes (${countPasses(passes)})`, null),
    ...Object.entries(passes).map(([suite, tests]) => {
      return createElement('div', ['suite', 'pass'], suite, [
        ...tests.map(test => createElement('div', ['test'], test, null)),
      ]);
    }),
  ]);
  container.appendChild(results);
}

function logResults(passes: Passes, failures: Failures) {
  console.log('Test results:');
  
  console.log(`Passes (${countPasses(passes)}):`, passes);
  for (const [suite, tests] of Object.entries(passes)) {
    console.log('  ' + suite);
    for (const test of tests) {
      console.log('    ' + test);
    }
  }

  console.log(`Failures (${countFailures(failures)}):`, failures);
  for (const [suite, testErrors] of Object.entries(failures)) {
    console.log('  ' + suite);
    for (const [test, errors] of Object.entries(testErrors)) {
      console.log('    ' + test);
      for (const failure of errors) {
        console.log('      ' + failure.stack);
      }
    }
  }
}

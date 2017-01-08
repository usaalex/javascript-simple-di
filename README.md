# JavaScript Simple Dependency Injection

Simple and straightforward Dependency Injection lib (POC).

## Features
1. Manages dependencies for you in "angular" fashion;
2. Detects circular dependencies;
3. Detects missing or unresolved dependencies;
4. Separate scopes for different sets of dependable objects.

## How to

```
Injector.global() // or new Injector('[scope name]') if separate scope is required
        // register module/service/primitives
        .register('<Module name>', <Injectable>, ['<List>', '<of>', '<dependencies>']) // registered modules names
        // resolve
        .resolveAll(); // or .resolve('<Module name>')
```

## Notes
* Passing a class as Injectable will instantiate it once per scope (making it a singleton).
* Only classes or functions can have dependencies.
* Dependencies are injected through a constructor or function parameters in the same order as they are registered (angular-way).
* Different scopes will have different instances of modules.

## Examples

```
const settings = {
    version: '1.0.2',
    name: 'some-app'
};

let names = ['Ann', 'Paul', 'Alex'];

let user1 = { id: 1, name: 'Alex' };

let meaningOfLife = 42;

class Service0 {    
    constructor() {
        console.log('service 0 - im free of dependencies!');
    }
}

class Service1 {
    constructor(settings, listOfNames, user, meaning, s0) {
        console.log('service 1', settings, listOfNames, user, meaning, s0);
    }
}

class Service2 {
    constructor(s: Service1) { // has a dependency
        console.log('service 2', s);        
    }
}

class Service3 {
    constructor(s: Service2) { // has a dependency
        console.log('service 3', s);
    }
}

class Service4 {
    constructor(s2: Service2, s3: Service3) { // has a dependency
        console.log('service 4', s2, s3);
    }
}

Injector.global().register('settings', settings)
                 .register('names', names)
                 .register('number42', meaningOfLife)
                 .register('user', user1)
                 .register('s0', Service0)
                 .register('s1', Service1, ['settings', 'names', 'user', 'number42', 's0']) // the order is important!
                 .register('s2', Service2, ['s1'])
                 .register('s3', Service3, ['s2'])
                 .register('s4', Service4, ['s2', 's3'])
                 .resolveAll(); // will be resolved fine

new Injector('WithError').register('s0', Service0)
                         .register('s1', Service1, ['s0', 's1'])
                         .resolveAll(); // will not be resolved due to circular dependency error

// angular run equivalent
new Injector('Functions!').register('func', function(str){ console.log(str); })
                          .register('world', 'hello world')
                          .resolveAll(); // hello world

// registering functions the right way
// angular factory equivalent
function func(world) { // inject "world"
    return function hello() {
        console.log(world, arguments);
    }
}

let factory = new Injector('factory');
factory.register('func', func, ['world']).register('world', 'Injected string!').resolveAll();
let helloWorld = factory.get<any>('func'); // get registered module
helloWorld(1, 2, 3); // Injected string! 1 2 3
```

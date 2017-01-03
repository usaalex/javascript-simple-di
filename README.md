# JavaScript Simple Dependency Injection

Simple and straightforward Dependency Injection.

## How to

```
Injector.getInstance()
        // register module/service/primitives
        .register('<Module name>', <Injectable>, ['<List>', '<of>', '<dependencies>'])
        // resolve
        .resolve();
```

## Examples

```
const appSettings = {
    version: '1.0',
    isProduction: false
};
const someValue = 42;
const someValues = [1, 2, 3];

class Service1 {    
    constructor(private settings: any) {
        
    }

    doStuff() {   
        if (this.settings.isProduction)
            return 42;        
        else 
            return 0;
    }
}

class Service2 {
    constructor(private s1: Service1) {    

    }

    doSomething() {        
        return this.s1.doStuff();        
    }
}

class App {

    constructor(service: Service2, data: any[], meaningOfLife: number) {   
        console.log('service ', service.doSomething());
        console.log('data', data);
        console.log('meaningOfLife', meaningOfLife);
    }

}

Injector.getInstance().register('App', App, ['AppService', 'ArrayOfStuff', 'Number42'])
                      .register('Service1', Service1, ['Settings'])
                      .register('AppService', Service2, ['Service1'])
                      .register('ArrayOfStuff', someValues)
                      .register('Number42', someValue)
                      .register('Settings', appSettings)
                      .resolve();

```

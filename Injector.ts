/**
 * Injector.ts 
 * Light-weight dependency injection library. Plain and stupid.
 */

export default Injector;

class Module {

    name: string;
    injectable:  any;
    dependencies: string[];
    instance: any;
    instantiatible: boolean;
    resolved: boolean;
    
    constructor(name: string, injectable: any, dependencies: string[]) {        
        this.name = name;
        this.injectable = injectable;
        this.dependencies = dependencies;            
        this.instantiatible = typeof injectable === 'function';
        if (!this.instantiatible) this.dependencies = [];        
    }

}

class InjectorError extends Error {

    constructor(injector: Injector, message: string) {
        super(`Injector[${injector.scope}]: ${message}`);        
    }

}

class Injector {
    
    private static instance = null;
    private modules: Module[] = [];

    /** Create new instance of Injector in a separate scope.
     * @param scope Injector scope name.
     */
    constructor(public scope: string = '') {
        
    }

    private resolveFor(module: Module, resolveQueue: string[] = []): any {
        if (resolveQueue.indexOf(module.name) > -1) throw new InjectorError(this, `Circular dependency in "${module.name}" module.`);             
        resolveQueue.push(module.name);                   
        let injectables = []; // list of resolved modules (dependencies) to inject into current module 
        this.modules.filter(m => !!module.dependencies.filter(d => d === m.name).length).forEach(m => {                                                
            let index = module.dependencies.findIndex(d => d === m.name); // find argument position                   
            injectables[index] = (m.resolved ? m.instance : this.resolveFor(m, resolveQueue));                                                        
        });         
        let unresolvedIndex = injectables.findIndex(i => i == null);               
        if (unresolvedIndex > -1) throw new InjectorError(this, `Module "${module.name}" has unresolved dependencies.`);
        module.instance = (module.instantiatible ? new module.injectable(...injectables) : module.injectable);
        module.resolved = true;
        return module.instance;
    }

    /** Resolve module dependencies.
     * @param name Module name.      
     */
    resolve<T>(name: string): T { 
        let module = this.modules.find(m => m.name === name);
        if (module == null) throw new InjectorError(this, `Could not find module "${name}".`);            
        return (module.resolved ? module.instance : this.resolveFor(module));        
    }

    /** Resolve all registered modules.      
    */
    resolveAll(): void {
        this.modules.filter(m => !m.resolved).forEach(m => this.resolveFor(m));
    }

    /** Register a module.
     * @param name Module name. Must be unique.
     * @param injectable Injectable object (class, object, primitive value etc.).
     * @param dependencies List of module dependencies.     
     */
    register(name: string, injectable: any, dependencies: string[] = []): Injector {    
        if (typeof name != 'string' || !name) throw new InjectorError(this, `"${name}" is not valid module name.`);
        if (injectable == null) throw new InjectorError(this, 'null or undefined cannot be registered as a module.');
        if (this.modules.filter(d => d && d.name === name).length > 0) throw new InjectorError(this, `Module "${name}" already registered.`);        
        this.modules.push(new Module(name, injectable, dependencies));            
        return this;
    }

    /** Get resolved module.
     * @param name Module name.
     */
    get<T>(name: string): T {
        let module = this.modules.find(m => m.name === name);
        return (module != null ? module.instance : null);
    }

    static globalInjector = null;
    static global(): Injector {
        if (Injector.globalInjector == null) Injector.globalInjector = new Injector('GLOBAL');
        return Injector.globalInjector;
    }
}

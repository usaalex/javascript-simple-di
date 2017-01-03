export { Injector };

class Module {
    name: string;
    injectable:  any;
    dependencies: string[];
    instance: any;
    instantiatible: boolean;
    resolved: boolean;
    
    constructor(args?: { name, injectable, dependencies, instance }) {
        if (args != null) {
            this.name = args.name;
            this.injectable = args.injectable;
            this.dependencies = args.dependencies;
            this.instance = args.instance;
            this.instantiatible = typeof args.injectable === 'function';
        }
    }        
}

class Injector {

    private static instance = null;
    private modules: Module[] = [];

    private constructor() {
        
    }

    static getInstance(): Injector {
        if (Injector.instance == null) Injector.instance = new Injector();
        return  Injector.instance;
    }

    private resolveFor(module: Module): any {        
        let resolvedDependencies = [];
        this.modules.filter(m => !!module.dependencies.filter(d => d === m.name).length).forEach(m => {            
            if (module === m) throw new Error('Dependency of itself.');
            if (!!m.dependencies.filter(d => d === module.name).length) throw new Error('Circular dependency.');            
            let index = module.dependencies.findIndex(d => d === m.name); // find argument position
            if (m.instance != null) { // already instantiated
                resolvedDependencies[index] = m.instance;
                return;
            }                        
            resolvedDependencies[index] = this.resolveFor(m);
        });        
        module.instance = (module.instantiatible ? new module.injectable(...resolvedDependencies) : module.injectable);
        module.resolved = true;
        return module.instance;
    }

    /** Resolve all dependencies.
     * 
     */
    resolve(): void {                
        this.modules.filter(m => !m.resolved).forEach(m => {
            if (m.instance != null) return;
            this.resolveFor(m);
        });
    }

    /** Register a module.
     * @param name Module name. Must be unique.
     * @param injectable Injectable object (class, object, primitive value etc.).
     * @param dependencies List of module dependencies.
     */
    register(name: string, injectable: any, dependencies: string[] = []): Injector {    
        if (typeof name != 'string' || !name) throw new Error('Name is required.');
        if (this.modules.filter(d => d && d.name === name).length > 0) throw new Error(`Module "${name}" already registered.`);        
        this.modules.push(new Module({
            name: name,
            injectable: injectable,
            dependencies: dependencies,
            instance: null            
        }));
        return this;
    }

    /** Get resolved module.
     * @param name Module name.
     */
    get<T>(name: string): T {
        let module = this.modules.find(m => m.name === name);
        return module != null ? module.instance : null;
    }
}
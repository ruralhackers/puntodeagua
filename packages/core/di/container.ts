/**
 * Abstract container for managing all instances in the application.
 * Uses the template pattern to allow custom dependency registration.
 */
export abstract class Container {
  private readonly instances: Map<string, unknown> = new Map()

  constructor() {
    this.registerInstances()
  }

  /**
   * Template method that must be implemented by subclasses to register custom dependencies.
   * This method is called during container initialization.
   */
  protected abstract registerInstances(): void

  /**
   * Register an instance in the container with a specific key.
   * @param key - The key to register the instance under
   * @param instance - The instance to register
   */
  register<T>(key: string | symbol, instance: T): void {
    this.instances.set(key.toString(), instance)
  }

  /**
   * Get an instance from the container.
   * @param key - The key of the instance to get
   * @returns The instance
   */
  get<T>(key: string | symbol): T {
    if (!this.instances.has(key.toString())) {
      throw new Error(`Instance with key '${key.toString()}' not found.`)
    }
    return this.instances.get(key.toString()) as T
  }
}

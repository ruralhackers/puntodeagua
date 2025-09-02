import type { Type } from "../types/type";
import { InjectionToken } from "./injection-token";

/**
 * Abstract container for managing all instances in the application.
 * Uses the template pattern to allow custom dependency registration.
 */
export abstract class Container {
	private readonly instances: Map<string, unknown> = new Map();

	constructor() {
		this.registerInstances();
	}

	/**
	 * Template method that must be implemented by subclasses to register custom dependencies.
	 * This method is called during container initialization.
	 */
	protected abstract registerInstances(): void;

	/**
	 * Register an instance in the container.
	 * @param instance - The instance to register
	 */
	register<T>(instance: T): void {
		const key = (instance as { constructor: { name: string } }).constructor
			.name;
		this.instances.set(key, instance);
	}

	/**
	 * Register an instance in the container with a specific key.
	 * @param key - The key to register the instance under
	 * @param instance - The instance to register
	 */
	registerWithKey<T>(key: string, instance: T): void {
		this.instances.set(key, instance);
	}

	/**
	 * Get an instance from the container.
	 * @param key - The key of the instance to get
	 * @returns The instance
	 */
	get<T>(key: string): T {
		if (!this.instances.has(key)) {
			throw new Error(`Instance with key '${key}' not found.`);
		}
		return this.instances.get(key) as T;
	}

	/**
	 * Create an instance of a class.
	 * If the class is already registered in the container, return the existing instance.
	 * @param classType - The class to create an instance of
	 * @returns The instance
	 */
	create<T>(classType: Type<T>): T {
		// Try to find the class in the instances map
		for (const [key, instance] of this.instances.entries()) {
			if (instance instanceof classType) {
				return instance as T;
			}
		}

		// Try to find the class by its name in the InjectionToken enum
		const className = classType.name;
		for (const token of Object.values(InjectionToken)) {
			if (token === className && this.instances.has(token)) {
				return this.instances.get(token) as T;
			}
		}

		// If not found, create a new instance
		throw new Error(
			`Instance of type ${classType.name} not found in container. It must be registered beforehand.`,
		);
	}
}

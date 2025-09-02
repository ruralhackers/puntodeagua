import type { Type } from "../types/type";

/**
 * Container interface for managing all instances in the application.
 */
export interface Container {
	/**
	 * Register an instance in the container.
	 * @param instance - The instance to register
	 */
	register<T>(instance: T): void;

	/**
	 * Register an instance in the container with a specific key.
	 * @param key - The key to register the instance under
	 * @param instance - The instance to register
	 */
	registerWithKey<T>(key: string, instance: T): void;

	/**
	 * Get an instance from the container.
	 * @param key - The key of the instance to get
	 * @returns The instance
	 */
	get<T>(key: string): T;

	/**
	 * Create an instance of a class.
	 * If the class is already registered in the container, return the existing instance.
	 * @param classType - The class to create an instance of
	 * @returns The instance
	 */
	create<T>(classType: Type<T>): T;
}

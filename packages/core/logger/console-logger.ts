export class ConsoleLogger {
	static readonly ID = "ConsoleLogger";

	log(message: string): void {
		console.log(message);
	}
}

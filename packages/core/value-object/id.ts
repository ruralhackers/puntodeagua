import type {IdSchema} from "../types/id.schema.ts";

export class Id {
    private constructor(private readonly value: string) {
    }

    static create(id: IdSchema) {
        return new Id(id);
    }
}

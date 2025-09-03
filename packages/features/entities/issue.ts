import {Id} from "core";
import type {IssueSchema} from "../schemas/issue.schema.ts";

export class Issue {
	private constructor(
		public readonly id: Id,
		public name: string,
	) {}

  static create(issueSchema: IssueSchema) {
    return new Issue(
      Id.create(issueSchema.id),
      issueSchema.name,
    );
  }

  toDto() {
    return {
      id: this.id.toString(),
      name: this.name,
    };
  }
}

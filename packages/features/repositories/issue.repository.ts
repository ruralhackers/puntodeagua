import type {Deletable, FindableAll, FindableById, Savable} from "core";
import type {Issue} from "../entities/issue.ts";
import type {IssueDto} from "../entities/issue.dto.ts";
import type {CreateIssueDto} from "../entities/create-issue.dto.ts";

export interface IssueRepository extends Savable<CreateIssueDto>, Deletable<Issue>, FindableById<Issue>, FindableAll<Issue> {
}

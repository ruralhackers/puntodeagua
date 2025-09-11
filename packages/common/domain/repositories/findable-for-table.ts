import type { TableQueryParams, TableQueryResult } from "./table-query-port";

export interface FindableForTable<In> {
  findForTable(input: TableQueryParams):Promise<TableQueryResult<In>
}

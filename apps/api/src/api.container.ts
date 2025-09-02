import { CoreContainer } from "core";
import { GetWaterPointsQry } from "./get-water-points.qry";

export class ApiContainer extends CoreContainer {
	protected override registerInstances(): void {
		// Register core dependencies first
		super.registerInstances();

		// Register API-specific use cases
		const getWaterPointsQry = new GetWaterPointsQry();
		this.register(GetWaterPointsQry.ID, getWaterPointsQry);
	}
}

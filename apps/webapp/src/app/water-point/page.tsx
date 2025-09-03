import {UseCaseService} from "core";
import type { NextPage } from "next";
import {webAppContainer} from "@/core/di/webapp.container";
import {GetWaterPointsQry} from "@/features/water-point/application/get-water-points.qry";
import { WaterPointPage } from "@/features/water-point/delivery/water-point.page";

const Page: NextPage = async () => {
	const waterPoints = await webAppContainer.get<UseCaseService>(UseCaseService.ID).execute(GetWaterPointsQry);

	return <WaterPointPage waterPoints={waterPoints} />;
};
export default Page;

import type { NextPage } from "next";
import { WaterPointPage } from "@/features/water-point/delivery/water-point.page";

const Page: NextPage = async () => {
	const waterPoints = await useCaseService.execute(GetWaterPointsQry);

	return <WaterPointPage waterPoints={waterPoints} />;
};
export default Page;

import { type FC } from "react";
import {WaterPoint} from "features/entities/water-point";
import {Page} from "@/core/components/page";

export const WaterPointPage: FC<{ waterPoints: WaterPoint[] }> = ({ waterPoints}) => {
	return <Page>
        <div>
            {waterPoints.map(x => x.toDto().id)}
        </div>
    </Page>;
};

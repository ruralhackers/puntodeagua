import { Input } from "@/components/ui/input";
import WaterMeterCard from "./components/WaterMeterCard";

export default function WaterMeterPage() {
    return (
        <div>
            <div>
                <p>Contadores</p>
                <p>Gestión de contadores y control de consumos</p>
            </div>
            <div>
                <Input type="search" placeholder="Buscar por nombre..." />
            </div>
            <WaterMeterCard />
        </div>
    )
}

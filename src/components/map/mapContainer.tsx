import { useAppSelector } from "@/store/hook";
import JHJZ from "./jhjz";
import Map from "./Map";

export default () => {
  const polynomial = useAppSelector((state) => state.polynomial.polynomial);
  return <>{!polynomial ? <Map /> : <JHJZ />}</>;
};

import AccordionComponent from "@/components/acordeon/AccordionComponent";
import Encuestas from "@/pages/encuestas";
import Equipos from "@/pages/equip_sede";

const accordionItems = [
  { title: "Encuestas", content: <Encuestas /> },
  { title: "Equipos", content: <Equipos /> },
];

export default function AccordionPage() {
  return <AccordionComponent items={accordionItems} />;
}
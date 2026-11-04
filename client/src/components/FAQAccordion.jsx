import { Minus, Plus } from "lucide-react";
import { useState } from "react";

const FAQAccordion = ({ items }) => {
  const [openIndex, setOpenIndex] = useState(0);

  return (
    <div className="divide-y divide-line rounded-xl border border-line bg-white">
      {items.map((item, index) => {
        const isOpen = openIndex === index;
        const panelId = `faq-panel-${index}`;

        return (
          <div key={item.question}>
            <h3>
              <button
                type="button"
                onClick={() => setOpenIndex(isOpen ? -1 : index)}
                aria-expanded={isOpen}
                aria-controls={panelId}
                className="flex w-full items-center justify-between gap-6 px-5 py-5 text-left sm:px-6"
              >
                <span className="font-bold text-text sm:text-lg">{item.question}</span>
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-paper text-text">
                  {isOpen ? <Minus size={16} /> : <Plus size={16} />}
                </span>
              </button>
            </h3>
            <div id={panelId} hidden={!isOpen}>
              <p className="max-w-2xl px-5 pb-6 leading-7 text-muted sm:px-6">{item.answer}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default FAQAccordion;

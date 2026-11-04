import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, ChevronRight, Star } from "lucide-react";
import { useState } from "react";

const TestimonialCarousel = ({ testimonials }) => {
  const [index, setIndex] = useState(0);
  const count = testimonials.length;
  const active = testimonials[index] || testimonials[0];

  if (!active) return null;

  const rating = Math.max(0, Math.min(5, Number(active.rating) || 0));
  const go = (step) => setIndex((current) => (current + step + count) % count);

  return (
    <figure className="rounded-xl border border-line bg-white p-6 sm:p-10">
      <div className="flex gap-1" role="img" aria-label={`Rated ${rating} out of 5`}>
        {Array.from({ length: 5 }).map((_, starIndex) => (
          <Star
            key={starIndex}
            size={18}
            aria-hidden="true"
            className={starIndex < rating ? "fill-lamp text-lamp" : "text-line"}
          />
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={active._id || active.name}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
        >
          <blockquote className="mt-6 max-w-4xl text-xl font-semibold leading-[1.5] text-text sm:text-2xl">
            “{active.review}”
          </blockquote>
          <figcaption className="mt-8 flex items-center gap-4">
            {active.image && (
              <img src={active.image} alt="" className="h-12 w-12 rounded-full object-cover" loading="lazy" />
            )}
            <span>
              <span className="block font-bold text-text">{active.name}</span>
              {active.location && <span className="block text-sm text-muted">{active.location}</span>}
            </span>
          </figcaption>
        </motion.div>
      </AnimatePresence>

      {count > 1 && (
        <div className="mt-10 flex items-center gap-4">
          <button
            type="button"
            onClick={() => go(-1)}
            aria-label="Previous review"
            className="grid h-11 w-11 place-items-center rounded-full border border-line text-text transition hover:border-masking hover:bg-masking hover:text-white"
          >
            <ChevronLeft size={19} />
          </button>
          <button
            type="button"
            onClick={() => go(1)}
            aria-label="Next review"
            className="grid h-11 w-11 place-items-center rounded-full border border-line text-text transition hover:border-masking hover:bg-masking hover:text-white"
          >
            <ChevronRight size={19} />
          </button>
          <p className="text-sm text-muted" aria-live="polite">
            {index + 1} of {count}
          </p>
        </div>
      )}
    </figure>
  );
};

export default TestimonialCarousel;

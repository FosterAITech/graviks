import { BookOpen, Flame, Projector, Shirt, Wrench, Package } from "lucide-react";

const icons = {
  "projector-screens": Projector,
  books: BookOpen,
  hardware: Wrench,
  clothing: Shirt,
  crackers: Flame,
};

// Product photo, or a neat placeholder when no photo has been added yet.
const ProductImage = ({ src, alt = "", category, className = "", imgClassName = "", eager = false }) => {
  const Icon = icons[category] || Package;
  return (
    <div className={`relative overflow-hidden bg-paper ${className}`}>
      {src ? (
        <img
          src={src}
          alt={alt}
          className={`h-full w-full object-contain ${imgClassName}`}
          loading={eager ? "eager" : "lazy"}
          decoding="async"
        />
      ) : (
        <div className="grid h-full w-full place-items-center text-muted/50" role={alt ? "img" : undefined} aria-label={alt || undefined}>
          <Icon size={44} strokeWidth={1.25} aria-hidden="true" />
        </div>
      )}
    </div>
  );
};

export default ProductImage;

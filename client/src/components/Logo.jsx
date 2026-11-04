// Text logo. Replace with an <img> once the real logo file is added to src/assets.
const Logo = ({ tone = "dark" }) => (
  <span className="flex items-center gap-2.5">
    <span aria-hidden="true" className="relative grid h-9 w-11 place-items-center rounded-[5px] bg-masking ring-1 ring-white/15">
      <span className="h-5 w-8 rounded-[2px] bg-white" />
      <span className="absolute -bottom-1.5 h-1 w-4 rounded-full bg-lamp" />
    </span>
    <span className={`text-[1.35rem] font-extrabold tracking-[-0.03em] ${tone === "dark" ? "text-white" : "text-text"}`}>
      Garviks
    </span>
  </span>
);

export default Logo;

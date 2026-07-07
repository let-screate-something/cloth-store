export default function AboutPage() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-24 text-center">
      <h1 className="text-5xl font-bold tracking-tight mb-8 bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-purple-400">
        About FutureCloth
      </h1>
      <p className="text-xl text-neutral-300 leading-relaxed mb-8">
        FutureCloth is a revolutionary apparel brand focused on blending cutting-edge fashion with modern technology. Our mission is to provide you with the most comfortable, stylish, and futuristic clothing available on the market today.
      </p>
      <div className="grid md:grid-cols-3 gap-8 mt-16 text-left">
        <div className="bg-neutral-900/50 p-6 rounded-2xl border border-white/5">
          <h3 className="text-xl font-semibold mb-3">Innovation</h3>
          <p className="text-neutral-400 text-sm">We use the latest fabrics and manufacturing techniques to create clothing that lasts longer and feels better.</p>
        </div>
        <div className="bg-neutral-900/50 p-6 rounded-2xl border border-white/5">
          <h3 className="text-xl font-semibold mb-3">Sustainability</h3>
          <p className="text-neutral-400 text-sm">Our processes are designed to minimize environmental impact, ensuring a better future for our planet.</p>
        </div>
        <div className="bg-neutral-900/50 p-6 rounded-2xl border border-white/5">
          <h3 className="text-xl font-semibold mb-3">Community</h3>
          <p className="text-neutral-400 text-sm">We build more than just clothes; we build a community of forward-thinking individuals.</p>
        </div>
      </div>
    </div>
  );
}

import Image from 'next/image';
import Link from 'next/link';

const palette = {
  gold: '#FFDD26',
  amber: '#FFBE1D',
  graphite: '#302F2C',
  white: '#F2F2F2',
};

export default function Home() {
  return (
    <div className="min-h-screen bg-[#FFDD26] text-[#302F2C]">
      {/* Parallax hero */}
      <div
        className="relative min-h-screen w-full overflow-hidden"
        style={{
          backgroundImage:
            'url("/images/RAMA%20WORKS%20M65-B%20-%20Krittin%20Tachasiritanakul.jpg")',
          backgroundSize: 'contain',
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'center',
          backgroundAttachment: 'fixed',
          backgroundColor: palette.gold,
        }}
      >
        <div className="absolute inset-0 bg-linear-to-b from-[#FFDD26]/70 via-[#FFDD26]/55 to-[#FFDD26]/30"></div>
        <div className="absolute inset-0 bg-linear-to-t from-black/25 via-transparent to-transparent mix-blend-multiply"></div>

        <header className="relative z-10 container mx-auto px-6 py-6 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <div className="relative w-12 h-12">
              <Image
                src="/logos/logo_bg.png"
                alt="PCBuilder+ logo"
                fill
                className="object-contain rounded-md"
                sizes="64px"
                priority
              />
            </div>
            <span className="text-xl font-bold text-[#302F2C]">PCBuilder+</span>
          </Link>
          <Link
            href="/build"
            className="px-5 py-3 rounded-xl font-semibold bg-[#302F2C] text-[#FFDD26] hover:opacity-90 transition shadow-md shadow-black/15"
          >
            Start now
          </Link>
        </header>

        <div className="relative z-10 min-h-[70vh] flex items-center">
          <div className="container mx-auto px-6">
            <div className="max-w-3xl bg-white/85 backdrop-blur-md rounded-3xl p-8 shadow-2xl border border-[#302F2C]/10">
              <div className="inline-flex items-center gap-3 px-4 py-2 bg-[#FFDD26] text-[#302F2C] rounded-full text-sm font-semibold shadow-sm">
                Your best PC builder platform.
              </div>
              <h1 className="mt-4 text-4xl md:text-5xl font-black leading-tight text-[#302F2C]">
                Build your perfect PC with confidence.
              </h1>
              <p className="mt-3 text-lg text-[#302F2C]/80">
                Validate every part, avoid incompatibilities, and get guided recommendations instantly.
              </p>
              <div className="mt-6 flex flex-col sm:flex-row gap-3">
                <Link
                  href="/build"
                  className="px-6 py-3 rounded-xl font-semibold bg-[#302F2C] text-[#FFDD26] hover:opacity-90 transition shadow-md shadow-black/20 text-center"
                >
                  Build your PC
                </Link>
                <Link
                  href="/components"
                  className="px-6 py-3 rounded-xl font-semibold border-2 border-[#302F2C] text-[#302F2C] hover:bg-[#302F2C]/5 transition text-center"
                >
                  Browse components
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Cards section */}
      <section className="py-16 bg-[#FFDD26]">
        <div className="container mx-auto px-6">
          <div className="grid gap-6 md:grid-cols-3">
            {[
              {
                title: 'Build your PC',
                desc: 'Start from scratch with guided compatibility checks and golden-path suggestions.',
                cta: 'Start building',
                href: '/build',
                image: '/images/build_your_pc.jpg'
              },
              {
                title: 'Community builds',
                desc: 'Explore community-curated rigs and iterate on proven configurations.',
                cta: 'View builds',
                href: '/community',
                image: '/images/community_builds.jpg'
              },
              {
                title: 'Our recommended builds',
                desc: 'Pick from expert-crafted presets optimized for performance and budget.',
                cta: 'See recommendations',
                href: '/recommended',
                image: '/images/our_recommended_builds.jpg'
              },
            ].map((card) => (
              <Link
                key={card.title}
                href={card.href}
                className="group h-full rounded-2xl bg-white shadow-[0_15px_50px_-25px_rgba(0,0,0,0.35)] border border-[#302F2C]/10 p-6 flex flex-col justify-between hover:-translate-y-1 hover:shadow-[0_20px_60px_-25px_rgba(0,0,0,0.45)] transition"
              >
                <div>
                  <h3 className="text-2xl font-bold text-[#302F2C]">{card.title}</h3>
                  <p className="mt-3 text-[#302F2C]/75">{card.desc}</p>
                </div>
                <div className="mt-6 mb-4 inline-flex items-center gap-2 self-start rounded-xl bg-[#302F2C] px-4 py-2 text-[#FFDD26] font-semibold shadow-md shadow-[#302F2C]/15 transition group-hover:-translate-y-0.5 group-hover:shadow-lg">
                  {card.cta}
                  <span className="transition group-hover:translate-x-1">→</span>
                </div>
                <div className="relative w-full aspect-4/4 overflow-hidden rounded-xl">
                  <Image
                    src={card.image}
                    alt={card.title}
                    fill
                    className="object-cover w-full h-full transition duration-300 group-hover:scale-105"
                    sizes="100%"
                    priority
                  />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}


import Image from 'next/image';
import Link from 'next/link';

const palette = {
  gold: '#FFDD26',
  amber: '#FFBE1D',
  graphite: '#302F2C',
  white: '#F2F2F2',
};

const componentCatalog = [
  {
    key: 'cpu',
    title: 'Processors (CPU)',
    description: 'Drives overall performance and compute speed for every workload.',
    icon: '/icons/cpu.png',
    href: '/components/cpu',
    available: true,
  },
  {
    key: 'motherboard',
    title: 'Motherboards',
    description: 'Socket, chipset, and expansion that define your entire build.',
    icon: '/icons/motherboard.png',
    href: '/components/motherboard',
    available: true,
  },
  {
    key: 'gpu',
    title: 'Graphics cards (GPU)',
    description: '3D rendering, gaming, creative workloads, and heavy visuals.',
    icon: '/icons/graphic-card.png',
    available: true,
  },
  {
    key: 'ram',
    title: 'Memory (RAM)',
    description: 'Responsiveness and smooth multitasking across apps.',
    icon: '/icons/ram.png',
    available: true,
  },
  {
    key: 'storage',
    title: 'Storage',
    description: 'Capacity plus NVMe/SATA speeds for projects and media.',
    icon: '/icons/storage.png',
    available: false,
  },
  {
    key: 'psu',
    title: 'Power supplies (PSU)',
    description: 'Stable power delivery, certifications, and the right wattage.',
    icon: '/icons/power-supply.png',
    available: true,
  },
  {
    key: 'cooling',
    title: 'Cooling',
    description: 'Keep thermals in check with air or liquid solutions.',
    icon: '/icons/fan.png',
    available: true,
  },
  {
    key: 'case',
    title: 'Cases',
    description: 'Space, airflow, and aesthetics for your setup.',
    icon: '/icons/case.png',
    available: true,
  },
  {
    key: 'monitor',
    title: 'Monitors',
    description: 'Resolution, refresh rate, and color fidelity.',
    icon: '/icons/monitor.png',
    available: true,
  },
  {
    key: 'peripherals',
    title: 'Peripherals',
    description: 'Keyboards, mice, audio, and comfort for daily use.',
    icon: '/icons/keyboard.png',
    available: true,
  },
  {
    key: 'os',
    title: 'Operating system',
    description: 'Licensing and base software options for your PC.',
    icon: '/icons/operative_system.png',
    available: true,
  },
  {
    key: 'webcam',
    title: 'Cameras & capture',
    description: 'For video calls, streaming, and content creation.',
    icon: '/icons/webcam.png',
    available: false,
  },
];

export default function ComponentsPage() {
  return (
    <div className="min-h-screen bg-[#FFDD26] text-[#302F2C]">
      {/* Parallax header */}
      <div
        className="relative min-h-[60vh] w-full overflow-hidden"
        style={{
          backgroundImage: 'url("/images/components_header.webp")',
          backgroundSize: 'cover',
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'center',
          backgroundAttachment: 'fixed',
          backgroundColor: palette.gold,
        }}
      >
        <div className="absolute inset-0 bg-linear-to-b from-[#FFDD26]/80 via-[#FFDD26]/55 to-[#FFDD26]/35" />
        <div className="absolute inset-0 bg-linear-to-t from-black/25 via-transparent to-transparent mix-blend-multiply" />

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

        <div className="relative z-10 container mx-auto px-6 py-14 flex items-center">
          <div className="max-w-3xl bg-white/90 backdrop-blur-md rounded-3xl p-8 shadow-2xl border border-[#302F2C]/10">
            <p className="text-sm font-semibold text-[#302F2C]/80">Components catalog</p>
            <h1 className="mt-2 text-4xl md:text-5xl font-black leading-tight text-[#302F2C]">
              Components for your next build
            </h1>
            <p className="mt-3 text-lg text-[#302F2C]/80">
              Explore the available categories and discover what you need. We start with the
              essentials and will keep adding more.
            </p>
            <div className="mt-5 flex flex-wrap gap-3">
              <Link
                href="/build"
                className="px-6 py-3 rounded-xl font-semibold bg-[#302F2C] text-[#FFDD26] hover:opacity-90 transition shadow-md shadow-black/20 text-center"
              >
                Start my build
              </Link>
              <Link
                href="#catalogo"
                className="px-6 py-3 rounded-xl font-semibold border-2 border-[#302F2C] text-[#302F2C] hover:bg-[#302F2C]/5 transition text-center"
              >
                Browse catalog
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Catalog */}
      <main className="relative" id="catalogo">
        <div className="absolute inset-0 bg-linear-to-b from-[#FFDD26] via-[#FFBE1D]/60 to-[#F2F2F2]/85" />
        <div className="relative container mx-auto px-6 pb-24 mt-24">
          <div className="rounded-3xl bg-white/85 backdrop-blur border border-[#302F2C]/10 p-8 shadow-[0_20px_60px_-30px_rgba(0,0,0,0.35)]">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-semibold text-[#302F2C]/70">Browse by category</p>
                <h2 className="text-3xl font-black text-[#302F2C]">Available components</h2>
                <p className="text-[#302F2C]/75">
                  Use the icons to quickly spot each category. We will roll out more with the same
                  look & feel.
                </p>
              </div>
              <div className="flex items-center gap-2 rounded-full bg-[#FFDD26] px-4 py-2 text-sm font-semibold text-[#302F2C] shadow-sm border border-[#302F2C]/10">
                <span className="h-2 w-2 rounded-full bg-[#302F2C]" />
                {componentCatalog.length} categories
              </div>
            </div>

            <div className="mt-8 grid auto-rows-[1fr] gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {componentCatalog.map((comp) => (
                <div
                  key={comp.key}
                  className={`group flex h-full flex-col rounded-2xl border border-[#302F2C]/10 bg-white/90 p-6 shadow-[0_18px_45px_-28px_rgba(0,0,0,0.35)] transition hover:-translate-y-1 hover:shadow-[0_20px_55px_-25px_rgba(0,0,0,0.45)] ${
                    comp.available ? '' : 'opacity-85'
                  }`}
                >
                  <div className="flex items-start gap-5">
                    <div className="relative h-20 w-20 rounded-2xl bg-[#FFBE1D]/25 border border-[#302F2C]/10 flex items-center justify-center overflow-hidden">
                      <Image
                        src={comp.icon}
                        alt={comp.title}
                        fill
                        className="object-contain p-3"
                        sizes="80px"
                        priority={comp.available}
                      />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-lg font-semibold text-[#302F2C]">{comp.title}</h3>
                        <span
                          className={`inline-flex items-center rounded-full px-2 py-1 text-[11px] font-semibold ${
                            comp.available
                              ? 'bg-[#302F2C]/10 text-[#302F2C]'
                              : 'bg-[#302F2C]/5 text-[#302F2C]/60'
                          }`}
                        >
                          {comp.available ? 'Available' : 'Coming soon'}
                        </span>
                      </div>
                      <p className="mt-2 text-sm text-[#302F2C]/75 leading-relaxed">
                        {comp.description}
                      </p>
                    </div>
                  </div>

                  <div className="mt-6 flex items-center justify-center">
                    {comp.available ? (
                      <Link
                        href={comp.href || '#'}
                        className="inline-flex items-center gap-2 rounded-xl bg-[#302F2C] px-4 py-2 text-sm font-semibold text-[#FFDD26] transition hover:opacity-90"
                      >
                        View components <span className="transition group-hover:translate-x-1 text-2xl">→</span>
                      </Link>
                    ) : (
                      <span className="text-sm font-semibold text-[#302F2C]/55">In progress</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}


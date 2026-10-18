import { useState, type FormEvent, type ReactNode } from "react";

type Page = "home" | "booking" | "rewards" | "nearby" | "handoff";
type Role = "Client" | "Stylist";

const heroImage =
  "https://images.unsplash.com/photo-1706565026362-8da2e41e0ba9?auto=format&fit=crop&w=1400&q=85";

const services = [
  { icon: "cut", title: "Cuts & shape", meta: "From $35 · 30–60 min", tone: "lavender" },
  { icon: "sparkle", title: "Color & creative", meta: "From $80 · 90–180 min", tone: "coral" },
  { icon: "wave", title: "Texture care", meta: "From $55 · 45–90 min", tone: "mint" },
  { icon: "bolt", title: "Braids & protective", meta: "From $65 · 60–240 min", tone: "yellow" },
];

const stylists = [
  { initials: "AM", name: "Alex Morgan", specialty: "Curls · Color", distance: "0.4 mi", rating: "4.9", tone: "violet" },
  { initials: "JK", name: "Jordan Kim", specialty: "Short cuts · Barbering", distance: "0.8 mi", rating: "4.8", tone: "coral" },
  { initials: "RN", name: "Riley N.", specialty: "Braids · Loc care", distance: "1.2 mi", rating: "5.0", tone: "mint" },
];

const specs = [
  {
    group: "Screen",
    name: "Landing / Discover",
    purpose: "Introduces Proxicut and routes visitors to discovery, booking, rewards, and authentication.",
    states: "Default, responsive navigation, active destination, image loading/fallback.",
    data: "location: string (optional); serviceCategory: enum (optional).",
    endpoint: "GET /api/stylists?lat={number}&lng={number}&service={string} → { stylists: Stylist[], total: number }",
    table: "stylists, services, locations",
    validation: "Location is trimmed; service must match an enabled service category.",
    access: "Both (public preview; personalized when authenticated)",
  },
  {
    group: "Component",
    name: "Role Login Modal",
    purpose: "Authenticates either a client or stylist from one role-aware entry point.",
    states: "Default, role selected, field focus, loading, error, authenticated.",
    data: "role: client | stylist (required); email: string (required); password: string (required).",
    endpoint: "POST /api/auth/login { role, email, password } → { user, accessToken, refreshToken }",
    table: "users, user_roles, sessions",
    validation: "Valid email; password minimum 8 characters; role must match the account.",
    access: "Both",
  },
  {
    group: "Screen",
    name: "Booking Flow",
    purpose: "Lets a client choose a service, stylist, and appointment time before confirming.",
    states: "Empty, selecting, selected, submitting, success, unavailable/error.",
    data: "serviceId: UUID (required); stylistId: UUID (required); startsAt: ISO datetime (required); notes: string (optional).",
    endpoint: "POST /api/bookings { serviceId, stylistId, startsAt, notes } → { booking, pointsEarned: number }",
    table: "bookings, availability, services, users",
    validation: "Future time; available slot; service offered by stylist; notes max 500 characters.",
    access: "Client",
  },
  {
    group: "Component",
    name: "Service Card",
    purpose: "Summarizes a bookable service category with starting price and duration.",
    states: "Default, hover, selected, disabled/unavailable, skeleton loading.",
    data: "id: UUID; name: string; startPrice: integer; durationMinutes: integer; available: boolean.",
    endpoint: "GET /api/services → { services: Service[] }",
    table: "services, stylist_services",
    validation: "Price must be non-negative; duration must be 15–480 minutes.",
    access: "Both",
  },
  {
    group: "Screen",
    name: "Fresh Streak Rewards",
    purpose: "Turns booking consistency into visible points, streaks, milestones, and rewards.",
    states: "New member, active streak, milestone reached, reward claimed, loading, error.",
    data: "points: integer; streakWeeks: integer; nextMilestone: integer; rewards: Reward[].",
    endpoint: "GET /api/rewards/me → { balance, streak, milestones, claimableRewards }",
    table: "reward_accounts, point_ledger, streaks, rewards",
    validation: "Points cannot be negative; one qualifying booking per streak interval; claims are idempotent.",
    access: "Client (stylists can see points awarded per completed booking)",
  },
  {
    group: "Screen",
    name: "Nearby Map",
    purpose: "Shows vetted stylists around the user with distance, rating, specialties, and availability.",
    states: "Permission prompt, locating, results, no results, permission denied, map error.",
    data: "latitude: number (required); longitude: number (required); radiusMiles: number (optional).",
    endpoint: "GET /api/locations/nearby?lat={number}&lng={number}&radius={number} → { stylists, mapBounds }",
    table: "locations, stylists, availability, reviews",
    validation: "Latitude −90–90; longitude −180–180; radius 1–50 miles.",
    access: "Both",
  },
  {
    group: "Component",
    name: "Stylist Result Card",
    purpose: "Helps clients compare a nearby stylist and start a booking.",
    states: "Default, hover, saved, unavailable, loading, error.",
    data: "stylistId: UUID; name: string; specialties: string[]; rating: number; distanceMiles: number; nextSlot: datetime.",
    endpoint: "GET /api/stylists/{id} → { stylist, services, portfolio, nextAvailability }",
    table: "stylists, profiles, reviews, stylist_services, availability",
    validation: "Rating 0–5; distance non-negative; stylist profile must be active.",
    access: "Both",
  },
  {
    group: "Screen",
    name: "Stylist Workspace",
    purpose: "Gives stylists role-protected access to schedule, client requests, services, and earnings.",
    states: "Onboarding, active, empty schedule, loading, payout hold, error.",
    data: "availability: TimeRange[]; serviceIds: UUID[]; bookingStatus: enum; payoutAccountId: string.",
    endpoint: "GET /api/stylist/dashboard → { today, requests, earnings, profileCompletion }",
    table: "stylists, availability, bookings, services, payouts",
    validation: "No overlapping availability; valid booking transitions; verified payout identity required.",
    access: "Stylist",
  },
];

function Icon({ name, className = "size-5" }: { name: string; className?: string }) {
  const paths: Record<string, ReactNode> = {
    arrow: <><path d="M5 12h14" /><path d="m13 6 6 6-6 6" /></>,
    bolt: <path d="m13 2-9 12h7l-1 8 9-12h-7l1-8Z" />,
    calendar: <><path d="M6 2v4M18 2v4M3 9h18" /><rect x="3" y="4" width="18" height="18" rx="3" /></>,
    check: <path d="m5 12 4 4L19 6" />,
    chevron: <path d="m9 18 6-6-6-6" />,
    cut: <><circle cx="6" cy="7" r="3" /><circle cx="6" cy="17" r="3" /><path d="m8.6 8.5 11.4 7M8.6 15.5 20 8" /></>,
    heart: <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8l1.1 1.1L12 21l7.8-7.5 1.1-1.1a5.5 5.5 0 0 0-.1-7.8Z" />,
    location: <><path d="M20 10c0 5-8 12-8 12S4 15 4 10a8 8 0 1 1 16 0Z" /><circle cx="12" cy="10" r="2.5" /></>,
    lock: <><rect x="4" y="10" width="16" height="11" rx="3" /><path d="M8 10V7a4 4 0 0 1 8 0v3" /></>,
    menu: <><path d="M4 7h16M4 12h16M4 17h16" /></>,
    search: <><circle cx="11" cy="11" r="7" /><path d="m20 20-4-4" /></>,
    sparkle: <><path d="m12 2 1.4 4.6L18 8l-4.6 1.4L12 14l-1.4-4.6L6 8l4.6-1.4L12 2Z" /><path d="m19 14 .8 2.2L22 17l-2.2.8L19 20l-.8-2.2L16 17l2.2-.8L19 14Z" /></>,
    star: <path d="m12 3 2.8 5.7 6.2.9-4.5 4.4 1.1 6.2-5.6-3-5.6 3 1.1-6.2L3 9.6l6.2-.9L12 3Z" />,
    user: <><circle cx="12" cy="8" r="4" /><path d="M4 22a8 8 0 0 1 16 0" /></>,
    wave: <path d="M3 8c3-4 6 4 9 0s6 4 9 0M3 16c3-4 6 4 9 0s6 4 9 0" />,
  };
  return <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[name]}</svg>;
}

function Brand({ onClick }: { onClick: () => void }) {
  return (
    <button onClick={onClick} className="flex items-center gap-2.5" aria-label="Go to home">
      <span className="grid size-9 place-items-center rounded-xl bg-violet-600 text-white shadow-sm"><Icon name="cut" className="size-5" /></span>
      <span className="text-xl font-extrabold tracking-[-0.04em] text-zinc-950">proxi<span className="text-violet-600">cut</span></span>
    </button>
  );
}

function Header({ page, navigate, onLogin }: { page: Page; navigate: (page: Page) => void; onLogin: (role: Role) => void }) {
  const [open, setOpen] = useState(false);
  const links: { label: string; page: Page }[] = [
    { label: "Discover", page: "home" }, { label: "Book", page: "booking" },
    { label: "Rewards", page: "rewards" }, { label: "Nearby", page: "nearby" }, { label: "Developer handoff", page: "handoff" },
  ];
  return (
    <header className="sticky top-0 z-40 border-b border-zinc-900/5 bg-[#fbfaf6]/90 backdrop-blur-xl">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-5 lg:px-8">
        <Brand onClick={() => navigate("home")} />
        <nav className="hidden items-center gap-1 lg:flex">
          {links.map((link) => <button key={link.page} onClick={() => navigate(link.page)} className={`rounded-full px-4 py-2 text-sm font-semibold transition ${page === link.page ? "bg-zinc-950 text-white" : "text-zinc-600 hover:bg-white hover:text-zinc-950"}`}>{link.label}</button>)}
        </nav>
        <div className="hidden items-center gap-2 sm:flex">
          <button onClick={() => onLogin("Stylist")} className="rounded-full px-4 py-2.5 text-sm font-bold text-zinc-700 transition hover:bg-white">Stylist login</button>
          <button onClick={() => onLogin("Client")} className="rounded-full bg-violet-600 px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-violet-600/20 transition hover:-translate-y-0.5 hover:bg-violet-700">Client login</button>
        </div>
        <button onClick={() => setOpen(!open)} className="grid size-10 place-items-center rounded-full bg-white lg:hidden" aria-label="Toggle menu"><Icon name="menu" /></button>
      </div>
      {open && <div className="border-t border-zinc-200 bg-[#fbfaf6] p-4 lg:hidden">{links.map((link) => <button key={link.page} onClick={() => { navigate(link.page); setOpen(false); }} className="block w-full rounded-xl px-4 py-3 text-left font-bold hover:bg-white">{link.label}</button>)}<div className="mt-3 grid grid-cols-2 gap-2"><button onClick={() => onLogin("Stylist")} className="rounded-xl border border-zinc-200 bg-white p-3 font-bold">Stylist login</button><button onClick={() => onLogin("Client")} className="rounded-xl bg-violet-600 p-3 font-bold text-white">Client login</button></div></div>}
    </header>
  );
}

function Home({ navigate }: { navigate: (page: Page) => void }) {
  return (
    <main>
      <section className="relative overflow-hidden px-5 pb-20 pt-14 lg:px-8 lg:pb-28 lg:pt-20">
        <div className="pointer-events-none absolute -left-28 top-28 size-72 rounded-full bg-orange-200/40 blur-3xl" />
        <div className="pointer-events-none absolute right-0 top-0 size-96 rounded-full bg-violet-200/50 blur-3xl" />
        <div className="mx-auto grid max-w-7xl items-center gap-12 lg:grid-cols-[1.05fr_.95fr]">
          <div className="relative z-10">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-violet-200 bg-white/80 px-4 py-2 text-xs font-extrabold uppercase tracking-[0.16em] text-violet-700 shadow-sm"><Icon name="sparkle" className="size-4" /> Hair without the labels</div>
            <h1 className="max-w-3xl text-5xl font-black leading-[.94] tracking-[-0.06em] text-zinc-950 sm:text-7xl lg:text-[5.4rem]">Your hair.<br /><span className="text-violet-600">Your rules.</span></h1>
            <p className="mt-7 max-w-xl text-lg leading-8 text-zinc-600">Find inclusive, verified hair pros who get your texture, your style, and your schedule. No gendered menus. No awkward guesses.</p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <button onClick={() => navigate("booking")} className="group flex items-center justify-center gap-3 rounded-full bg-zinc-950 px-7 py-4 font-extrabold text-white shadow-xl transition hover:-translate-y-1">Find my stylist <Icon name="arrow" className="size-5 transition group-hover:translate-x-1" /></button>
              <button onClick={() => navigate("nearby")} className="flex items-center justify-center gap-2 rounded-full border border-zinc-200 bg-white px-7 py-4 font-extrabold text-zinc-900 transition hover:border-violet-300 hover:bg-violet-50"><Icon name="location" /> Explore nearby</button>
            </div>
            <div className="mt-9 flex flex-wrap items-center gap-5 text-sm font-semibold text-zinc-500">
              <span className="flex items-center gap-2"><span className="flex -space-x-2"><i className="size-7 rounded-full border-2 border-[#fbfaf6] bg-violet-300" /><i className="size-7 rounded-full border-2 border-[#fbfaf6] bg-orange-300" /><i className="size-7 rounded-full border-2 border-[#fbfaf6] bg-emerald-300" /></span> 12k+ fresh cuts</span>
              <span className="flex items-center gap-1 text-zinc-700"><Icon name="star" className="size-4 fill-amber-400 text-amber-400" /> 4.9 average</span>
            </div>
          </div>
          <div className="relative mx-auto w-full max-w-xl">
            <div className="relative rotate-2 overflow-hidden rounded-[2.5rem] bg-violet-200 p-3 shadow-2xl shadow-violet-900/15">
              <img src={heroImage} alt="A stylist working with a client's hair in a bright salon" className="h-[31rem] w-full rounded-[2rem] object-cover object-center sm:h-[38rem]" />
              <div className="absolute bottom-7 left-7 right-7 flex items-center justify-between rounded-2xl bg-white/90 p-4 shadow-lg backdrop-blur-md">
                <div><p className="text-xs font-bold uppercase tracking-widest text-violet-600">Next opening</p><p className="mt-1 font-extrabold text-zinc-950">Today, 4:30 PM</p></div>
                <span className="grid size-11 place-items-center rounded-full bg-violet-600 text-white"><Icon name="calendar" /></span>
              </div>
            </div>
            <div className="absolute -left-5 top-14 -rotate-6 rounded-2xl bg-amber-300 px-4 py-3 text-sm font-black text-zinc-950 shadow-lg sm:-left-10">All textures welcome</div>
            <div className="absolute -right-3 top-1/3 rotate-6 rounded-2xl bg-zinc-950 px-4 py-3 text-sm font-black text-white shadow-lg sm:-right-10">No gender tax</div>
          </div>
        </div>
      </section>

      <section className="border-y border-zinc-200 bg-white px-5 py-20 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
            <div><p className="eyebrow">Start with your vibe</p><h2 className="section-title">Good hair days, on demand.</h2></div>
            <button onClick={() => navigate("booking")} className="flex items-center gap-2 font-extrabold text-violet-700 hover:text-violet-900">See all services <Icon name="arrow" /></button>
          </div>
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {services.map((service) => <button key={service.title} onClick={() => navigate("booking")} className={`service-card ${service.tone} group text-left`}><span className="mb-14 grid size-12 place-items-center rounded-2xl bg-white/70"><Icon name={service.icon} className="size-6" /></span><h3 className="text-xl font-extrabold tracking-tight">{service.title}</h3><p className="mt-2 text-sm font-semibold opacity-65">{service.meta}</p><span className="absolute right-5 top-5 grid size-9 place-items-center rounded-full bg-white opacity-0 transition group-hover:opacity-100"><Icon name="arrow" className="size-4" /></span></button>)}
          </div>
        </div>
      </section>

      <section className="px-5 py-20 lg:px-8 lg:py-28">
        <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-2 lg:items-center">
          <div className="rounded-[2.5rem] bg-zinc-950 p-8 text-white sm:p-12">
            <div className="mb-16 flex items-center justify-between"><span className="rounded-full bg-white/10 px-4 py-2 text-xs font-bold uppercase tracking-widest">Fresh streak</span><Icon name="bolt" className="size-8 text-amber-300" /></div>
            <p className="text-7xl font-black tracking-[-0.06em] text-amber-300">3<span className="text-3xl text-white"> weeks</span></p>
            <p className="mt-4 max-w-sm text-lg text-zinc-300">Keep your rhythm and unlock $10 off after your next visit.</p>
            <div className="mt-10 grid grid-cols-4 gap-2">{[1,2,3,4].map((week) => <div key={week} className={`rounded-xl p-3 text-center text-xs font-black ${week < 4 ? "bg-violet-600" : "border border-dashed border-white/30 text-zinc-500"}`}>{week < 4 ? <Icon name="check" className="mx-auto size-5" /> : "NEXT"}</div>)}</div>
          </div>
          <div className="lg:pl-12">
            <p className="eyebrow">Rewards that respect routine</p>
            <h2 className="section-title">Consistency looks good on you.</h2>
            <p className="mt-6 max-w-lg text-lg leading-8 text-zinc-600">Every completed booking earns points. Build a Fresh Streak, level up, and spend rewards on the services you actually want.</p>
            <ul className="mt-8 space-y-4">{["50 points for every booking", "Streak boosts for regular visits", "Shareable style milestones"].map((item) => <li key={item} className="flex items-center gap-3 font-bold text-zinc-800"><span className="grid size-7 place-items-center rounded-full bg-emerald-100 text-emerald-700"><Icon name="check" className="size-4" /></span>{item}</li>)}</ul>
            <button onClick={() => navigate("rewards")} className="mt-9 rounded-full bg-violet-600 px-6 py-3.5 font-extrabold text-white hover:bg-violet-700">Explore rewards</button>
          </div>
        </div>
      </section>
    </main>
  );
}

function Booking() {
  const [step, setStep] = useState(1);
  const [selectedService, setSelectedService] = useState(0);
  const [selectedStylist, setSelectedStylist] = useState(0);
  const [slot, setSlot] = useState("4:30 PM");
  const [confirmed, setConfirmed] = useState(false);
  if (confirmed) return <main className="page-wrap"><div className="mx-auto max-w-xl rounded-[2.5rem] bg-white p-10 text-center shadow-xl"><span className="mx-auto grid size-20 place-items-center rounded-full bg-emerald-100 text-emerald-700"><Icon name="check" className="size-10" /></span><p className="eyebrow mt-7">Booking confirmed</p><h1 className="mt-2 text-4xl font-black tracking-tight">You’re all set.</h1><p className="mt-4 text-zinc-600">Your appointment with {stylists[selectedStylist].name} is booked for Thursday at {slot}. You earned <strong>50 Fresh Points</strong>.</p><button onClick={() => { setConfirmed(false); setStep(1); }} className="mt-8 rounded-full bg-zinc-950 px-6 py-3 font-bold text-white">Book another</button></div></main>;
  return (
    <main className="page-wrap">
      <div className="mx-auto max-w-6xl">
        <p className="eyebrow">Easy booking</p><h1 className="section-title max-w-2xl">Your next great hair day starts here.</h1>
        <div className="mt-10 grid gap-8 lg:grid-cols-[1fr_20rem]">
          <div className="rounded-[2rem] border border-zinc-200 bg-white p-6 sm:p-8">
            <div className="mb-9 flex gap-2">{["Service", "Stylist", "Time"].map((label, i) => <button key={label} onClick={() => setStep(i + 1)} className={`flex-1 rounded-xl p-3 text-sm font-extrabold ${step === i + 1 ? "bg-violet-600 text-white" : i + 1 < step ? "bg-violet-100 text-violet-700" : "bg-zinc-100 text-zinc-400"}`}>{i + 1}. {label}</button>)}</div>
            {step === 1 && <div><h2 className="text-2xl font-extrabold">What are we doing?</h2><div className="mt-5 grid gap-3 sm:grid-cols-2">{services.map((service, i) => <button onClick={() => setSelectedService(i)} key={service.title} className={`rounded-2xl border p-5 text-left transition ${selectedService === i ? "border-violet-500 bg-violet-50 ring-2 ring-violet-200" : "border-zinc-200 hover:border-violet-300"}`}><Icon name={service.icon} /><p className="mt-5 font-extrabold">{service.title}</p><p className="mt-1 text-sm text-zinc-500">{service.meta}</p></button>)}</div></div>}
            {step === 2 && <div><h2 className="text-2xl font-extrabold">Choose your pro</h2><div className="mt-5 space-y-3">{stylists.map((stylist, i) => <button onClick={() => setSelectedStylist(i)} key={stylist.name} className={`flex w-full items-center gap-4 rounded-2xl border p-4 text-left ${selectedStylist === i ? "border-violet-500 bg-violet-50 ring-2 ring-violet-200" : "border-zinc-200"}`}><span className={`avatar ${stylist.tone}`}>{stylist.initials}</span><span className="flex-1"><strong className="block">{stylist.name}</strong><span className="text-sm text-zinc-500">{stylist.specialty}</span></span><span className="text-sm font-bold"><Icon name="star" className="inline size-4 fill-amber-400 text-amber-400" /> {stylist.rating}</span></button>)}</div></div>}
            {step === 3 && <div><h2 className="text-2xl font-extrabold">Pick a time</h2><p className="mt-2 text-zinc-500">Thursday, May 22 · Times in your local zone</p><div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3">{["10:00 AM","11:30 AM","1:00 PM","2:30 PM","4:30 PM","6:00 PM"].map((time) => <button key={time} onClick={() => setSlot(time)} className={`rounded-xl border p-4 font-bold ${slot === time ? "border-zinc-950 bg-zinc-950 text-white" : "border-zinc-200 hover:border-violet-400"}`}>{time}</button>)}</div></div>}
            <div className="mt-8 flex justify-between border-t border-zinc-100 pt-6"><button onClick={() => setStep(Math.max(1, step - 1))} disabled={step === 1} className="rounded-full px-5 py-3 font-bold text-zinc-500 disabled:opacity-30">Back</button><button onClick={() => step < 3 ? setStep(step + 1) : setConfirmed(true)} className="flex items-center gap-2 rounded-full bg-violet-600 px-6 py-3 font-extrabold text-white hover:bg-violet-700">{step < 3 ? "Continue" : "Confirm booking"} <Icon name="arrow" className="size-4" /></button></div>
          </div>
          <aside className="h-fit rounded-[2rem] bg-zinc-950 p-6 text-white lg:sticky lg:top-28">
            <p className="text-xs font-bold uppercase tracking-widest text-zinc-400">Your booking</p>
            <div className="mt-6 space-y-5"><div><p className="text-sm text-zinc-400">Service</p><p className="font-bold">{services[selectedService].title}</p></div><div><p className="text-sm text-zinc-400">Stylist</p><p className="font-bold">{stylists[selectedStylist].name}</p></div><div><p className="text-sm text-zinc-400">Time</p><p className="font-bold">Thu, May 22 · {slot}</p></div></div>
            <div className="mt-7 flex justify-between border-t border-white/10 pt-5"><span>Estimated total</span><strong>$55</strong></div>
            <div className="mt-5 rounded-xl bg-white/10 p-4 text-sm text-zinc-300"><Icon name="bolt" className="mb-2 size-5 text-amber-300" /> Earn <strong className="text-white">50 points</strong> when you complete this visit.</div>
          </aside>
        </div>
      </div>
    </main>
  );
}

function Rewards() {
  return <main className="page-wrap"><div className="mx-auto max-w-6xl"><p className="eyebrow">Fresh points</p><h1 className="section-title">Make your routine rewarding.</h1><div className="mt-10 grid gap-5 lg:grid-cols-[1.3fr_.7fr]"><section className="overflow-hidden rounded-[2.5rem] bg-violet-600 p-8 text-white sm:p-10"><div className="flex items-start justify-between"><div><p className="font-bold text-violet-200">Available balance</p><p className="mt-2 text-6xl font-black tracking-tight">680 <span className="text-2xl">pts</span></p></div><span className="grid size-14 place-items-center rounded-2xl bg-white/15"><Icon name="sparkle" className="size-7" /></span></div><div className="mt-16"><div className="flex justify-between text-sm font-bold"><span>Glow Getter</span><span>320 pts to Level 3</span></div><div className="mt-3 h-3 overflow-hidden rounded-full bg-white/20"><div className="h-full w-2/3 rounded-full bg-amber-300" /></div></div></section><section className="rounded-[2.5rem] bg-zinc-950 p-8 text-white"><p className="text-sm font-bold uppercase tracking-widest text-amber-300">Current streak</p><p className="mt-4 text-5xl font-black">3 weeks</p><p className="mt-3 text-zinc-400">Book by June 4 to keep it going.</p><div className="mt-8 flex gap-2">{[1,2,3,4].map(n => <span key={n} className={`grid size-11 place-items-center rounded-xl font-bold ${n < 4 ? "bg-amber-300 text-zinc-950" : "border border-dashed border-zinc-600 text-zinc-600"}`}>{n < 4 ? <Icon name="check" className="size-5" /> : "4"}</span>)}</div></section></div><h2 className="mt-14 text-2xl font-black">Your next unlocks</h2><div className="mt-5 grid gap-4 md:grid-cols-3">{[["$10 service credit","1,000 pts","bolt"],["Free deep condition","4-week streak","wave"],["Priority booking","Level 3","calendar"]].map(([name,meta,icon], i) => <article key={name} className="rounded-3xl border border-zinc-200 bg-white p-6"><span className={`grid size-12 place-items-center rounded-2xl ${i === 0 ? "bg-amber-100 text-amber-700" : i === 1 ? "bg-emerald-100 text-emerald-700" : "bg-violet-100 text-violet-700"}`}><Icon name={icon} /></span><h3 className="mt-8 text-lg font-extrabold">{name}</h3><p className="mt-1 text-sm font-semibold text-zinc-500">{meta}</p><button disabled className="mt-5 w-full rounded-full bg-zinc-100 py-3 text-sm font-bold text-zinc-400">Keep going</button></article>)}</div></div></main>;
}

function Nearby({ navigate }: { navigate: (page: Page) => void }) {
  const [active, setActive] = useState(0);
  return <main className="page-wrap"><div className="mx-auto max-w-7xl"><p className="eyebrow">Your neighborhood</p><h1 className="section-title">Great hair is closer than you think.</h1><div className="mt-8 flex max-w-xl items-center gap-3 rounded-full border border-zinc-200 bg-white p-2 pl-5 shadow-sm"><Icon name="search" className="text-zinc-400" /><input aria-label="Search location" defaultValue="Williamsburg, Brooklyn" className="min-w-0 flex-1 bg-transparent text-sm font-semibold outline-none" /><button className="rounded-full bg-zinc-950 px-5 py-3 text-sm font-bold text-white">Search</button></div><div className="mt-8 grid min-h-[35rem] overflow-hidden rounded-[2.5rem] border border-zinc-200 bg-white lg:grid-cols-[25rem_1fr]"><div className="order-2 space-y-3 overflow-auto p-4 lg:order-1">{stylists.map((stylist,i) => <button key={stylist.name} onClick={() => setActive(i)} className={`w-full rounded-2xl border p-5 text-left transition ${active === i ? "border-violet-500 bg-violet-50" : "border-zinc-200 hover:border-violet-300"}`}><div className="flex items-center gap-3"><span className={`avatar ${stylist.tone}`}>{stylist.initials}</span><span className="flex-1"><strong className="block">{stylist.name}</strong><span className="text-sm text-zinc-500">{stylist.distance} away</span></span><span className="text-sm font-bold">{stylist.rating} <Icon name="star" className="inline size-4 fill-amber-400 text-amber-400" /></span></div><p className="mt-4 text-sm font-semibold text-zinc-600">{stylist.specialty}</p><div className="mt-4 flex items-center justify-between"><span className="text-xs font-bold text-emerald-700">Available today</span><span onClick={(e) => { e.stopPropagation(); navigate("booking"); }} className="rounded-full bg-zinc-950 px-4 py-2 text-xs font-bold text-white">Book</span></div></button>)}</div><div className="relative order-1 min-h-[25rem] overflow-hidden bg-[#d9e4d8] lg:order-2"><div className="map-grid absolute inset-0 opacity-70" /><div className="absolute left-[8%] top-[20%] h-5 w-[90%] rotate-12 rounded-full bg-white/80" /><div className="absolute -left-[10%] top-[58%] h-7 w-[110%] -rotate-12 rounded-full bg-white/90" /><div className="absolute left-[35%] top-0 h-full w-5 rotate-6 bg-white/70" />{stylists.map((stylist,i) => <button key={stylist.name} onClick={() => setActive(i)} className={`absolute grid size-12 place-items-center rounded-full border-4 border-white font-black text-white shadow-xl transition ${active === i ? "scale-125 bg-violet-600" : "bg-zinc-900"}`} style={{ left: `${25 + i * 24}%`, top: `${24 + (i % 2) * 34}%` }}>{stylist.initials}</button>)}<div className="absolute bottom-5 left-5 rounded-2xl bg-white/90 p-4 shadow-lg backdrop-blur"><p className="text-xs font-bold uppercase tracking-widest text-violet-600">Selected</p><p className="mt-1 font-extrabold">{stylists[active].name}</p><p className="text-sm text-zinc-500">{stylists[active].distance} · Next: 4:30 PM</p></div></div></div></div></main>;
}

function Handoff() {
  return <main className="page-wrap"><div className="mx-auto max-w-7xl"><div className="grid gap-8 lg:grid-cols-[1fr_18rem] lg:items-end"><div><p className="eyebrow">Build-ready documentation</p><h1 className="section-title">Developer handoff</h1><p className="mt-5 max-w-2xl text-lg leading-8 text-zinc-600">A concise implementation contract for every primary screen and reusable component in this demo. Example endpoints assume JSON over HTTPS and role-based bearer authentication.</p></div><div className="rounded-2xl bg-violet-100 p-5 text-sm text-violet-900"><strong className="block text-2xl">{specs.length}</strong> documented surfaces<br /><span className="text-violet-700">4 screens · 4 components</span></div></div><div className="mt-12 space-y-5">{specs.map((spec, i) => <article key={spec.name} className="overflow-hidden rounded-3xl border border-zinc-200 bg-white"><div className="flex flex-col gap-4 border-b border-zinc-100 p-6 sm:flex-row sm:items-center"><span className="grid size-10 shrink-0 place-items-center rounded-xl bg-zinc-950 text-sm font-black text-white">{String(i + 1).padStart(2,"0")}</span><div><p className="text-xs font-black uppercase tracking-widest text-violet-600">{spec.group}</p><h2 className="mt-1 text-xl font-black">{spec.name}</h2></div><p className="max-w-xl text-sm leading-6 text-zinc-500 sm:ml-auto sm:text-right">{spec.purpose}</p></div><div className="grid gap-px bg-zinc-100 md:grid-cols-2 lg:grid-cols-3"><SpecCell title="States" text={spec.states} /><SpecCell title="Data" text={spec.data} mono /><SpecCell title="Suggested API" text={spec.endpoint} mono /><SpecCell title="Database" text={spec.table} mono /><SpecCell title="Validation" text={spec.validation} /><SpecCell title="Role access" text={spec.access} /></div></article>)}</div></div></main>;
}

function SpecCell({ title, text, mono = false }: { title: string; text: string; mono?: boolean }) {
  return <div className="bg-white p-6"><p className="mb-2 text-xs font-black uppercase tracking-widest text-zinc-400">{title}</p><p className={`text-sm leading-6 text-zinc-700 ${mono ? "font-mono text-[.78rem]" : ""}`}>{text}</p></div>;
}

function LoginModal({ initialRole, onClose }: { initialRole: Role; onClose: () => void }) {
  const [role, setRole] = useState<Role>(initialRole);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const submit = (e: FormEvent) => { e.preventDefault(); setLoading(true); window.setTimeout(() => { setLoading(false); setDone(true); }, 700); };
  return <div className="fixed inset-0 z-50 grid place-items-center bg-zinc-950/50 p-4 backdrop-blur-sm" onMouseDown={onClose}><div onMouseDown={(e) => e.stopPropagation()} className="w-full max-w-md rounded-[2rem] bg-white p-7 shadow-2xl">{done ? <div className="py-8 text-center"><span className="mx-auto grid size-16 place-items-center rounded-full bg-emerald-100 text-emerald-700"><Icon name="check" className="size-8" /></span><h2 className="mt-6 text-3xl font-black">Welcome back.</h2><p className="mt-2 text-zinc-500">{role} demo authentication successful.</p><button onClick={onClose} className="mt-7 rounded-full bg-zinc-950 px-6 py-3 font-bold text-white">Continue</button></div> : <><div className="flex items-center justify-between"><div><p className="eyebrow">Secure access</p><h2 className="mt-1 text-3xl font-black">Log in to Proxicut</h2></div><button onClick={onClose} className="grid size-10 place-items-center rounded-full bg-zinc-100 text-xl" aria-label="Close">×</button></div><div className="mt-7 grid grid-cols-2 gap-2 rounded-2xl bg-zinc-100 p-1.5">{(["Client","Stylist"] as Role[]).map(r => <button key={r} onClick={() => setRole(r)} className={`rounded-xl py-3 text-sm font-extrabold ${role === r ? "bg-white text-violet-700 shadow-sm" : "text-zinc-500"}`}>{r}</button>)}</div><form onSubmit={submit} className="mt-6 space-y-4"><label className="block"><span className="mb-2 block text-sm font-bold">Email address</span><input required type="email" placeholder={`you@${role.toLowerCase()}.com`} className="field" /></label><label className="block"><span className="mb-2 block text-sm font-bold">Password</span><input required minLength={8} type="password" placeholder="At least 8 characters" className="field" /></label><div className="flex items-center justify-between text-sm"><label className="flex items-center gap-2 text-zinc-600"><input type="checkbox" className="accent-violet-600" /> Remember me</label><button type="button" className="font-bold text-violet-700">Forgot password?</button></div><button disabled={loading} className="flex w-full items-center justify-center gap-2 rounded-full bg-violet-600 py-4 font-extrabold text-white disabled:opacity-60">{loading ? "Signing in…" : `Continue as ${role}`} {!loading && <Icon name="arrow" className="size-4" />}</button></form><p className="mt-5 flex items-center justify-center gap-2 text-xs text-zinc-400"><Icon name="lock" className="size-3.5" /> Demo only — no credentials are stored</p></>}</div></div>;
}

function Footer({ navigate }: { navigate: (page: Page) => void }) {
  return <footer className="border-t border-zinc-200 bg-white px-5 py-10 lg:px-8"><div className="mx-auto flex max-w-7xl flex-col gap-6 sm:flex-row sm:items-center sm:justify-between"><Brand onClick={() => navigate("home")} /><p className="text-sm text-zinc-500">Inclusive care. Better hair days. Built for everyone.</p><button onClick={() => navigate("handoff")} className="text-sm font-bold text-violet-700">Developer handoff</button></div></footer>;
}

export default function App() {
  const [page, setPage] = useState<Page>("home");
  const [loginRole, setLoginRole] = useState<Role | null>(null);
  const navigate = (next: Page) => { setPage(next); window.scrollTo({ top: 0, behavior: "smooth" }); };
  return <div className="min-h-screen bg-[#fbfaf6] text-zinc-950"><Header page={page} navigate={navigate} onLogin={setLoginRole} />{page === "home" && <Home navigate={navigate} />}{page === "booking" && <Booking />}{page === "rewards" && <Rewards />}{page === "nearby" && <Nearby navigate={navigate} />}{page === "handoff" && <Handoff />}<Footer navigate={navigate} />{loginRole && <LoginModal initialRole={loginRole} onClose={() => setLoginRole(null)} />}</div>;
}

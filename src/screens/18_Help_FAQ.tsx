/* eslint-disable */
/**
 * Screen 18 — Help & FAQ
 * Ported from the Google Stitch export
 * (_campusfit_screens/18_Help_FAQ.html) with a working search filter and
 * animated accordion (the original relied on inline JS we rewired).
 */
import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface Faq {
  question: string;
  answer: string;
}

const FAQS: Faq[] = [
  {
    question: 'How do QR checkpoints work?',
    answer:
      'Scanning QR codes at major campus landmarks allows you to earn points for your house and track your walking routes. Simply open the QR scanner in the Map tab and aim it at any physical CampusFit sign to instantly register your progress.',
  },
  {
    question: 'How do I create a club?',
    answer:
      "Navigate to the Groups tab and tap the '+' icon. You can choose a name, upload a logo, and invite your friends to join your fitness journey.",
  },
  {
    question: 'How does FitTrip work?',
    answer:
      'FitTrip calculates virtual distances based on your actual walking steps, allowing you to "travel" to worldwide campuses with your student peers.',
  },
  {
    question: "Why can't I comment on FitClips?",
    answer:
      'To maintain a positive environment, comments are only available to users who have completed their daily 10-minute mindful walk.',
  },
  {
    question: 'How is my campus rank calculated?',
    answer:
      'Your rank is a weighted combination of total steps, calories burned, and checkpoint badges earned over a rolling 7-day period.',
  },
];

export default function Stitch18_Help_FAQ() {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [openIndex, setOpenIndex] = useState(0);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return FAQS.map((faq, index) => ({ faq, index }));
    return FAQS.map((faq, index) => ({ faq, index })).filter(
      ({ faq }) =>
        faq.question.toLowerCase().includes(q) || faq.answer.toLowerCase().includes(q)
    );
  }, [query]);

  return (
    <>
      <header className="flex justify-between items-center w-full sticky top-0 z-40 bg-background/80 backdrop-blur-md px-container-padding pt-md pb-xs">
        <div className="flex items-center gap-sm">
          <button
            onClick={() => navigate(-1)}
            aria-label="Go back"
            className="material-symbols-outlined text-primary active:scale-90 transition-transform"
          >
            arrow_back
          </button>
          <h1 className="font-headline-lg-mobile text-headline-lg-mobile font-bold text-primary">Help &amp; FAQ</h1>
        </div>
        <div
          onClick={() => navigate('/profile')}
          className="w-10 h-10 rounded-full bg-surface-container-high flex items-center justify-center overflow-hidden border border-outline/10 cursor-pointer transition active:scale-95"
        >
          <img
            className="w-full h-full object-cover"
            alt="A professional studio portrait of a university student with a friendly expression, wearing a minimalist green sweatshirt. Soft lighting, high-end digital photography style, clean warm cream background, representing a reliable student health profile photo."
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuA75Hh42JUPbP0l6UwwLgcAgARnF9vFFtFxtcO3ykbDG8Lh6ewKSbit43c6E6vIDthtY3fACT8nuHd9djfxM64Gd6BymTsYs7GPv0dHvnxDIbyCkDp4NlKeqt9KhvyR1f1a1IBSiuEj2r4b7W7RLq4RqaqFWmM1UyzmnNvhZ8qGr6ceyzD7FLma1dUyMTTLhT54FbT6GU3oTGQDWnGPmP555hJeO7b6IUVJEyKVN6FDlr5bAR_UrtE8ZdhyySqgA7guzv92UC4xulFs"
          />
        </div>
      </header>
      <main className="px-container-padding pb-8">
        <section className="mt-md">
          <div className="relative flex items-center">
            <span className="material-symbols-outlined absolute left-4 text-on-surface-variant">search</span>
            <input
              className="w-full bg-surface-container-lowest border border-outline/10 rounded-full py-4 pl-12 pr-11 focus:ring-2 focus:ring-primary/20 focus:outline-none transition-all placeholder:text-on-surface-variant/60 font-body-md text-body-md shadow-sm"
              placeholder="Search for help..."
              type="search"
              value={query}
              onChange={e => setQuery(e.target.value)}
            />
            {query && (
              <button
                onClick={() => setQuery('')}
                aria-label="Clear search"
                className="absolute right-4 material-symbols-outlined text-on-surface-variant hover:text-primary transition-colors"
              >
                close
              </button>
            )}
          </div>
        </section>

        <section className="mt-lg grid grid-cols-2 gap-card-gap">
          <button
            onClick={() => navigate('/report')}
            className="bg-surface-container-lowest border border-outline/5 rounded-xl p-md flex flex-col items-center justify-center text-center gap-xs hover:bg-surface-container-low transition-colors group"
          >
            <div className="w-12 h-12 rounded-full bg-error-container/20 flex items-center justify-center mb-xs group-hover:scale-110 transition-transform">
              <span className="material-symbols-outlined text-error" style={{ fontVariationSettings: "'FILL' 1" }}>
                report
              </span>
            </div>
            <span className="font-label-md text-label-md text-on-surface leading-tight">Report a problem</span>
          </button>
          <button
            onClick={() => navigate('/report')}
            className="bg-surface-container-lowest border border-outline/5 rounded-xl p-md flex flex-col items-center justify-center text-center gap-xs hover:bg-surface-container-low transition-colors group"
          >
            <div className="w-12 h-12 rounded-full bg-primary-container/20 flex items-center justify-center mb-xs group-hover:scale-110 transition-transform">
              <span className="material-symbols-outlined text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>
                headset_mic
              </span>
            </div>
            <span className="font-label-md text-label-md text-on-surface leading-tight">Contact support</span>
          </button>
        </section>

        <section className="mt-xl">
          <h2 className="font-title-md text-title-md text-on-surface mb-md">Frequently asked questions</h2>
          <div className="space-y-sm">
            {visible.map(({ faq, index }) => {
              const isOpen = openIndex === index;
              return (
                <div
                  key={faq.question}
                  className={`accordion-item ${isOpen ? 'active' : ''} bg-surface-container-lowest border border-outline/5 rounded-xl px-md pt-md overflow-hidden transition-colors`}
                >
                  <button
                    onClick={() => setOpenIndex(isOpen ? -1 : index)}
                    aria-expanded={isOpen}
                    className="w-full flex justify-between items-start gap-sm text-left pb-md"
                  >
                    <span className="font-body-md font-semibold text-on-surface">{faq.question}</span>
                    <span className="material-symbols-outlined chevron-icon transition-transform text-on-surface-variant">
                      expand_more
                    </span>
                  </button>
                  <div className="accordion-content">
                    <p className="text-on-surface-variant font-body-md">{faq.answer}</p>
                  </div>
                </div>
              );
            })}
            {visible.length === 0 && (
              <p className="text-on-surface-variant font-body-md py-6 text-center">
                No answers match “{query}”. Try different words or contact support.
              </p>
            )}
          </div>
        </section>

        <section className="mt-xl flex flex-col items-center gap-xs">
          <div
            onClick={() => navigate('/report')}
            className="flex items-center gap-xs py-sm px-md rounded-full bg-surface-container hover:bg-surface-container-high transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-primary-container" style={{ fontVariationSettings: "'FILL' 1" }}>
              chat_bubble
            </span>
            <p className="font-label-md text-label-md text-on-surface-variant">
              Still need help? <span className="text-primary font-bold">Chat with us</span>
            </p>
          </div>
        </section>
      </main>
    </>
  );
}

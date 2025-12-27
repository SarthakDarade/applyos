'use client';

const COMPANIES = [
    { name: 'Google', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2f/Google_2015_logo.svg/2560px-Google_2015_logo.svg.png' },
    { name: 'Microsoft', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/96/Microsoft_logo_%282012%29.svg/2560px-Microsoft_logo_%282012%29.svg.png' },
    { name: 'Amazon', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a9/Amazon_logo.svg/1280px-Amazon_logo.svg.png' },
    { name: 'Apple', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1b/Apple_logo_grey.svg/1010px-Apple_logo_grey.svg.png' },
    { name: 'Netflix', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/08/Netflix_2015_logo.svg/2560px-Netflix_2015_logo.svg.png' },
    { name: 'Meta', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/ab/Meta-Logo.png/2560px-Meta-Logo.png' },
    { name: 'Tesla', logo: 'https://pngimg.com/uploads/tesla_logo/tesla_logo_PNG21.png' },
    { name: 'Uber', logo: 'https://upload.wikimedia.org/wikipedia/commons/c/cc/Uber_logo_2018.png' },
    { name: 'Airbnb', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/69/Airbnb_Logo_B%C3%A9lo.svg/2560px-Airbnb_Logo_B%C3%A9lo.svg.png' },
    { name: 'Spotify', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/26/Spotify_logo_with_text.svg/2560px-Spotify_logo_with_text.svg.png' },
    { name: 'Goldman Sachs', logo: 'https://www.pngmart.com/files/23/Goldman-Sachs-Logo-PNG-Isolated-HD.png' },
    { name: 'J.P. Morgan', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/af/J_P_Morgan_Logo_2008_1.svg/2560px-J_P_Morgan_Logo_2008_1.svg.png' },
    { name: 'McKinsey', logo: 'https://adassoc.org.uk/wp-content/uploads/2021/07/McKinsey.png' },
    { name: 'OpenAI', logo: 'https://freelogopng.com/images/all_img/1681142235openai-logo-png.png' },
];

export function SocialProof() {
    return (
        <div className="w-full py-8 border-b border-white/5 bg-white/5 overflow-hidden mb-8">
            <div className="text-center mb-6 px-4">
                <p className="text-xs md:text-sm font-semibold text-neutral-400 uppercase tracking-[0.2em]">
                    Optimized for 100+ Industry Leaders
                </p>
            </div>

            <div className="relative flex overflow-x-hidden group">
                {/* Marquee Container - Duplicated for infinite scroll effect */}
                <div className="flex animate-marquee whitespace-nowrap gap-16 px-8 items-center">
                    {[...COMPANIES, ...COMPANIES].map((company, i) => (
                        <div key={i} className="flex items-center justify-center opacity-50 hover:opacity-100 transition-opacity duration-300 contrast-0 hover:contrast-100 min-w-[100px]">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                                src={company.logo}
                                alt={company.name}
                                className="h-8 md:h-10 w-auto object-contain brightness-200 grayscale hover:grayscale-0 hover:brightness-100"
                            />
                        </div>
                    ))}
                </div>

                <div className="absolute top-0 flex animate-marquee2 whitespace-nowrap gap-16 px-8 items-center ml-16">
                    {[...COMPANIES, ...COMPANIES].map((company, i) => (
                        <div key={`dup-${i}`} className="flex items-center justify-center opacity-50 hover:opacity-100 transition-opacity duration-300 contrast-0 hover:contrast-100 min-w-[100px]">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                                src={company.logo}
                                alt={company.name}
                                className="h-8 md:h-10 w-auto object-contain brightness-200 grayscale hover:grayscale-0 hover:brightness-100"
                            />
                        </div>
                    ))}
                </div>
            </div>

            <style jsx>{`
                .animate-marquee {
                    animation: marquee 25s linear infinite;
                }
                .animate-marquee2 {
                    animation: marquee2 25s linear infinite;
                }
                @keyframes marquee {
                    0% { transform: translateX(0%); }
                    100% { transform: translateX(-100%); }
                }
                @keyframes marquee2 {
                    0% { transform: translateX(100%); }
                    100% { transform: translateX(0%); }
                }
            `}</style>
        </div>
    );
}

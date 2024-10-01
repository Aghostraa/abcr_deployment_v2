'use client'

import Image from 'next/image'
import GetInForm from '@/components/GetInForm'
import { motion, AnimatePresence } from 'framer-motion'
import { useState, useEffect } from 'react'
import KnowledgeHubSection from '@/components/KnowledgeHubSection'
import SponsorsSection from '@/components/SponsorsSection'
import TeamSection from '@/components/TeamSection'
import UpcomingEventsSection from '@/components/UpcomingEventsSection'

interface Slide {
  image: string;
  description: string;
}

interface Section {
  title: string;
  slides: Slide[];
}

interface SectionSlideshowProps extends Section {
  index: number;
}

const sections: Section[] = [
  {
    title: 'Learn',
    slides: [
      {
        image: '/images/Learn/learn1.jpg',
        description: 'Learn about cutting edge tech with our own workshops.'
      },
      {
        image: '/images/Learn/learn2.jpeg',
        description: 'Learn about hackathon opportunities and prepare yourself for the next one.'
      },
      {
        image: '/images/Learn/learn3.jpeg',
        description: 'Join in Online discussions with different protocol builders across the whole space.'
      },
      {
        image: '/images/Learn/learn4.jpeg',
        description: 'Bootcamps with industry leaders.'
      }
    ]
  },
  {
    title: 'Build',
    slides: [
      {
        image: '/images/Build/build1.jpeg',
        description: 'Build cool stuff together with our builders.'
      },
      {
        image: '/images/Build/build2.jpeg',
        description: 'Join our team of hackers and participate for hackathons, tickets and accommodation on us!'
      }
    ]
  },
  {
    title: 'Network',
    slides: [
      {
        image: '/images/Network/network1.jpeg',
        description: 'Connect with blockchain professionals at our monthly networking events.'
      },
      {
        image: '/images/Network/network2.jpeg',
        description: 'Engage in thought-provoking discussions at our blockchain meetups.'
      },
      {
        image: '/images/Network/network3.jpeg',
        description: 'Build lasting relationships within our diverse blockchain community.'
      }
    ]
  }
]

export default function Home() {
  return (
    <>
      <header className="container mx-auto px-4 py-6 flex flex-col md:flex-row justify-between items-center">
        <Image
          src="/images/abc-logo.png"
          alt="Aachen Blockchain Club Logo"
          width={150}
          height={50}
          className="rounded-lg mb-4 md:mb-0"
        />
        <nav className="flex flex-wrap justify-center">
          <a href="#about" className="mr-4 mb-2 hover:text-blue-300 transition-colors">About</a>
          <a href="#mission" className="mr-4 mb-2 hover:text-blue-300 transition-colors">Mission</a>
          <a href="#events" className="mr-4 mb-2 hover:text-blue-300 transition-colors">Events</a>
          <a href="#knowledge-hub" className="mr-4 mb-2 hover:text-blue-300 transition-colors">Knowledge Hub</a>
          <a href="#sponsors" className="mr-4 mb-2 hover:text-blue-300 transition-colors">Sponsors</a>
          <a href="#team" className="mr-4 mb-2 hover:text-blue-300 transition-colors">Team</a>
          <a href="#get-in" className="hover:text-blue-300 transition-colors">Get In</a>
        </nav>
      </header>

      <main className="container mx-auto px-4 py-16">
        <motion.div 
          className="flex flex-col lg:flex-row items-center justify-between mb-24"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="lg:w-1/2 mb-12 lg:mb-0">
            <h1 className="text-5xl font-bold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600">
              Welcome to Aachen Blockchain Club
            </h1>
            <p className="text-xl mb-8">
              Join our community of builders, innovators, and blockchain enthusiasts. 
              Earn ABCr points, complete tasks, and grow your skills!
            </p>
            <div className="flex space-x-4">
              <a href="#about" className="btn-primary">Learn More</a>
              <a href="#get-in" className="btn-secondary">See Projects</a>
            </div>
          </div>
          <motion.div 
            className="lg:w-1/2"
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <Image
              src="/images/group.jpeg"
              alt="Blockchain Illustration"
              width={500}
              height={500}
              className="rounded-lg shadow-lg"
            />
          </motion.div>
        </motion.div>

        <motion.section 
          id="about" 
          className="my-24"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <h2 className="text-3xl font-bold mb-12 text-center text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-green-400">
            About Aachen Blockchain Club
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {sections.map((section, index) => (
              <SectionSlideshow key={section.title} {...section} index={index} />
            ))}
          </div>
        </motion.section>

        <section id="mission" className="my-24">
          <MissionStatementSection />
        </section>

        <section id="events">
          <UpcomingEventsSection />
        </section>

        {/* Knowledge Hub Section */}
        <section id="knowledge-hub">
          <KnowledgeHubSection />
        </section>

        {/* Sponsors Section */}
        <section id="sponsors">
          <SponsorsSection />
        </section>

        {/* Team Section */}
        <section id="team">
          <TeamSection />
        </section>

        <motion.section 
          id="get-in" 
          className="my-24"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <h2 className="text-3xl font-bold mb-8 text-center text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-green-400">
            Go to Dashboard
          </h2>
          <div className="max-w-md mx-auto glass-panel p-8 rounded-lg">
            <GetInForm />
          </div>
        </motion.section>
      </main>
    </>
  )
}


function MissionStatementSection() {
  const challenges = [
    {
      title: "Designers",
      description: "Dive into the design of apps, wallets, and platforms for the decentralized web, where user autonomy and peer-to-peer interaction are central.",
      icon: "🎨"
    },
    {
      title: "Engineers",
      description: "Explore how decentralized systems interact with the physical world through IoT, edge computing, and Web3 infrastructure, and build the next generation of technology to support them.",
      icon: "🛠️"
    },
    {
      title: "Business & Economists",
      description: "Develop new economic systems, token models, and decentralized finance (DeFi) solutions that challenge traditional business practices, fostering new forms of peer-to-peer commerce and collaboration.",
      icon: "📊"
    },
    {
      title: "Social Scientists & Philosophers",
      description: "Help shape governance models, ethical frameworks, and societal impacts of decentralized technologies. Explore how blockchain and AI will reshape our social structures and human interactions.",
      icon: "🧠"
    },
    {
      title: "Artists & Creatives",
      description: "Discover how blockchain and decentralized platforms can revolutionize art ownership, distribution, and collaboration, giving artists full control over their digital and physical creations.",
      icon: "🎭"
    }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-12"
    >
      <div className="text-center mb-12">
        <h2 className="text-4xl font-bold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600">
          Our Mission
        </h2>
        <p className="text-xl max-w-3xl mx-auto">
          At ABC, we are your gateway to reimagining the future of technology. As a dynamic and interdisciplinary community, we bring together students, innovators, and thinkers from all fields to reshape the way we interact with decentralized systems, blockchain, AI, and peer-to-peer networks.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {challenges.map((challenge, index) => (
          <motion.div
            key={index}
            className="bg-gradient-to-br from-purple-900 to-indigo-900 rounded-lg p-6 shadow-lg hover:shadow-xl transition-all duration-300"
            whileHover={{ scale: 1.05, rotate: 1 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <div className="text-4xl mb-4">{challenge.icon}</div>
            <h3 className="text-2xl font-semibold mb-3">{challenge.title}</h3>
            <p className="text-gray-300">{challenge.description}</p>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}

function SectionSlideshow({ title, slides, index }: SectionSlideshowProps) {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prevSlide) => (prevSlide + 1) % slides.length);
    }, 5000);

    return () => clearInterval(timer);
  }, [slides.length]);

  return (
    <motion.div 
      className="relative overflow-hidden rounded-lg shadow-lg h-96"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 * index }}
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={currentSlide}
          className="absolute top-0 left-0 w-full h-full"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Image
            src={slides[currentSlide].image}
            alt={`${title} ${currentSlide + 1}`}
            layout="fill"
            objectFit="cover"
          />
        </motion.div>
      </AnimatePresence>
      <div className="absolute inset-0 bg-black bg-opacity-50 flex flex-col justify-end p-6">
        <h3 className="text-2xl font-bold mb-2">{title}</h3>
        <AnimatePresence mode="wait">
          <motion.p
            key={currentSlide}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            {slides[currentSlide].description}
          </motion.p>
        </AnimatePresence>
      </div>
      <div className="absolute bottom-4 left-0 right-0 flex justify-center space-x-2">
        {slides.map((_, i) => (
          <button
            key={i}
            className={`w-3 h-3 rounded-full ${
              i === currentSlide ? 'bg-white' : 'bg-gray-400'
            }`}
            onClick={() => setCurrentSlide(i)}
          />
        ))}
      </div>
    </motion.div>
  )
}
'use client'

import Image from 'next/image'
import GetInForm from '@/components/GetInForm'
import { motion, AnimatePresence } from 'framer-motion'
import { useState, useEffect } from 'react'

const sections = [
  {
    title: 'Learn',
    slides: [
      {
        image: '/images/Learn/learn1.jpg',
        description: 'Learn about cutting edge tech with our own workshops.'
      },
      {
        image: '/images/Learn/learn2.jpeg',
        description: 'Learn about hackathon oppertunities and prepare yourself for the next one.'
      },
      {
        image: '/images/Learn/learn3.jpeg',
        description: 'Join in Online discussions with differnt protocol builder across the whole space.'
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
        description: 'Join our team of hackers and participate for hackathons, tickets and acommodation on us!'
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
    <div className="min-h-screen bg-gradient-to-br from-blue-900 to-purple-900 text-white">
      <header className="container mx-auto px-4 py-6 flex justify-between items-center">
        <Image
          src="/images/abc-logo.png"
          alt="Aachen Blockchain Club Logo"
          width={150}
          height={50}
          className="rounded-lg"
        />
        <nav>
          <a href="#about" className="mr-4 hover:text-blue-300 transition-colors">About</a>
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
              <a href="#get-in" className="btn-secondary">Get In</a>
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

        <motion.section 
          id="get-in" 
          className="my-24"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <h2 className="text-3xl font-bold mb-8 text-center text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-green-400">
            Get In
          </h2>
          <div className="max-w-md mx-auto glass-panel p-8 rounded-lg">
            <GetInForm />
          </div>
        </motion.section>
      </main>

      <footer className="bg-black bg-opacity-50 text-center py-8">
        <p>&copy; 2024 Aachen Blockchain Club. All rights reserved.</p>
      </footer>
    </div>
  )
}

function SectionSlideshow({ title, slides, index }) {
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
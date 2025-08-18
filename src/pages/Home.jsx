
/**
 * Home.jsx
 * Premium landing page for EliteCart. Glassmorphism, gradient theme, links to main features.
 */
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import Tilt from "react-parallax-tilt";

const features = [
  {
    title: "Explore Shop",
    description: "Browse a wide range of categories and premium selections.",
    link: "/shop",
    glow: "from-pink-500 to-purple-600",
  },
  {
    title: "Admin Panel",
    description: "Manage inventory, orders, and customer queries.",
    link: "/auth",
    glow: "from-yellow-400 to-orange-500",
  },
  {
    title: "Get Started",
    description: "Login or Sign up to unlock all features.",
    link: "/auth",
    glow: "from-blue-500 to-indigo-600",
  },
];

export default function Home() {
  return (
    <motion.div
      className="min-h-screen bg-gradient-to-r from-black/90 via-gray-900/80 to-pink-900/70 text-white px-0 py-0 flex flex-col items-center justify-center relative overflow-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1 }}
    >
      <header className="text-center mb-16">
        <motion.h1
          className="text-5xl md:text-6xl font-extrabold mb-4 tracking-tight font-sans bg-gradient-to-r from-pink-500 to-pink-400 text-transparent bg-clip-text"
          initial={{ y: -40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          Welcome to Pink-Island
        </motion.h1>
        <motion.p
          className="text-lg text-pink-200 font-medium"
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          Discover premium products, fast delivery, and intelligent shopping.
        </motion.p>
      </header>

      <div className="grid gap-14 md:grid-cols-3 px-2 md:px-16 w-full max-w-6xl">
        {features.map((card, index) => (
          <Tilt
            glareEnable={false}
            glareMaxOpacity={0.10}
            glareColor="#fff"
            glarePosition="all"
            scale={1.02}
            transitionSpeed={1500}
            key={index}
          >
            <motion.div
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 + index * 0.2 }}
              className={`relative rounded-3xl bg-white/10 backdrop-blur-lg border border-pink-600/30 p-10 shadow-xl overflow-hidden group`}
            >
              <div
                className={`absolute -inset-0.5 blur-2xl opacity-15 group-hover:opacity-30 transition duration-700 bg-gradient-to-r from-pink-600/40 via-gray-900/20 to-pink-900/30 rounded-3xl`}
              ></div>

              <Link to={card.link} className="relative z-10 block h-full">
                <h3 className="text-2xl font-bold mb-2 text-pink-400 font-sans">{card.title}</h3>
                <p className="text-base text-pink-100 font-medium">{card.description}</p>
              </Link>
            </motion.div>
          </Tilt>
        ))}
      </div>

      <footer className="mt-20 text-center text-pink-400 text-base font-sans">
        &copy; {new Date().getFullYear()} EliteCart. All rights reserved.
      </footer>
    </motion.div>
  );
}

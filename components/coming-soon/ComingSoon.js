import React from 'react'
import { LampContainer } from "@/components/ui/lamp";
import { Heart } from "lucide-react";
import { motion } from "motion/react";

const ComingSoon = () => {
  return (
   <div className="h-screen bg-black text-white relative">
      <div className="flex items-center justify-center h-full">
        <LampContainer>
          <motion.h1
            initial={{ opacity: 0.5, y: 100 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{
              delay: 0.3,
              duration: 0.8,
              ease: "easeInOut",
            }}
            className="mt-8 bg-linear-to-br from-slate-300 to-slate-500 py-4 bg-clip-text text-center text-4xl font-medium tracking-tight text-transparent md:text-7xl"
          >
            Transportation & Loading <br /> Coordination System
          </motion.h1>

          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{
              delay: 0.6,
              duration: 0.6,
              ease: "easeInOut",
            }}
            className="mt-16 text-center"
          >
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8, duration: 1 }}
              className="text-blue-200 text-xl font-medium"
            >
              Coming Soon
            </motion.div>
          </motion.div>
        </LampContainer>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{
          delay: 1.0,
          duration: 0.8,
          ease: "easeInOut",
        }}
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
      >
        <div className="flex items-center space-x-2 text-slate-400">
          <span>Made with</span>
          <Heart className="h-4 w-4 text-red-400 fill-current" />
          <span>by</span>
          <span className="font-semibold text-white">Zoya</span>
        </div>
      </motion.div>
    </div>
  )
}

export default ComingSoon
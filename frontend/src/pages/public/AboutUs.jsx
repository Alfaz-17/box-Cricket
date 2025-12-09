import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Info, Users, Target } from 'lucide-react'
import { Button } from '@/components/ui/Button'

const AboutUs = () => {
  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center space-y-4"
      >
        <h1
          style={{ fontFamily: 'Bebas Neue' }}
          className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent"
        >
          About Us
        </h1>
        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
          Discover who we are and our mission to simplify cricket box bookings.
        </p>
      </motion.div>

      <div className="grid gap-6 md:grid-cols-2">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="bg-card/50 backdrop-blur-sm border border-primary/10 rounded-xl p-6 shadow-lg"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-primary/10 rounded-lg">
              <Users className="w-6 h-6 text-primary" />
            </div>
            <h2 className="text-xl font-bold">Who We Are</h2>
          </div>
          <p className="text-muted-foreground leading-relaxed">
             We are "BookMyBox", but we aren't just developers—we are turf owner too. We built this platform to solve the challenges we faced running our own turf in Bhavnagar, bringing you a system that truly understands the game.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="bg-card/50 backdrop-blur-sm border border-primary/10 rounded-xl p-6 shadow-lg"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-secondary/10 rounded-lg">
              <Target className="w-6 h-6 text-secondary" />
            </div>
            <h2 className="text-xl font-bold">Our Mission</h2>
          </div>
          <p className="text-muted-foreground leading-relaxed">
            Our goal is to provide a seamless booking experience, allowing you to focus on the game rather than the logistics. We believe in the power of sports to bring people together.
          </p>
        </motion.div>
      </div>

 
     
  


      {/* Partner With Us Section - Tailored for Venue Owners */}
    {/* Partner With Us Section - Tailored for Venue Owners */}
<motion.section 
  initial={{ opacity: 0, y: 30 }}
  whileInView={{ opacity: 1, y: 0 }}
  viewport={{ once: true }}
  transition={{ duration: 0.8 }}
  className="py-12 relative overflow-hidden"
>
  <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-secondary/5 opacity-50 rounded-2xl" />
  <div className="relative z-10 text-center space-y-8 p-8 border border-primary/10 rounded-2xl bg-card/30 backdrop-blur-sm">
    
    <h2 className="text-3xl md:text-4xl font-black italic tracking-tighter text-foreground">
      OWN A <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">TURF?</span>
    </h2>
    
    <div className="max-w-3xl mx-auto">
      <h3 className="text-xl md:text-2xl font-bold mb-4 text-foreground">Built by Owner, For Owners</h3>

      <p className="text-lg text-muted-foreground mb-4 leading-relaxed">
        We understand the turf business because we are in it. As the owner of <span className="font-semibold text-primary">"BookMyBox"</span> in Bhavnagar, we built this platform to solve the very problems you face daily. 
        Partner with us to streamline your bookings and grow your business with a system that just works.
      </p>

      {/* 🔥 Added Professional Message for Bhavnagar Turf Owners */}
      <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
        If you own a turf in Bhavnagar and want to enable a clean, automated booking facility,
        we would be happy to onboard your venue to BookMyBox.  
        Contact us to get started and make your turf easily bookable for players.
      </p>

      <Link to="/support">
        <Button className="h-12 px-8 bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-lg uppercase tracking-wider rounded-full shadow-lg hover:shadow-xl hover:scale-105 transition-all">
          List Your Turf
        </Button>
      </Link>
    </div>
  </div>
</motion.section>

    </div>
  )
}

export default AboutUs

import { motion, useScroll, useTransform } from "framer-motion";
import { Sparkles, Zap, Shield, ChevronRight, Menu, Activity, BrainCircuit, Network, Fingerprint, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRef } from "react";

export default function Home() {
  const { scrollYProgress } = useScroll();
  const opacity = useTransform(scrollYProgress, [0, 0.2], [1, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.2], [1, 0.95]);

  return (
    <div className="min-h-[100dvh] w-full bg-background text-foreground overflow-x-hidden selection:bg-primary/30 font-sans">
      
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 md:px-12 py-6 backdrop-blur-xl bg-background/40 border-b border-white/5">
        <div className="flex items-center gap-3">
          <Sparkles className="w-6 h-6 text-primary drop-shadow-[0_0_8px_rgba(139,92,246,0.8)]" />
          <span className="font-bold tracking-[0.2em] text-sm uppercase text-white/90">ASTRA.AI</span>
        </div>
        <div className="hidden md:flex items-center gap-10 text-xs font-semibold tracking-widest text-muted-foreground uppercase">
          <a href="#capabilities" className="hover:text-white transition-colors duration-300">Capabilities</a>
          <a href="#intelligence" className="hover:text-white transition-colors duration-300">Intelligence</a>
          <a href="#security" className="hover:text-white transition-colors duration-300">Security</a>
        </div>
        <div className="flex items-center gap-6">
          <Button variant="ghost" className="hidden md:inline-flex text-muted-foreground hover:text-white font-semibold text-sm tracking-wide">LOG IN</Button>
          <Button className="bg-primary hover:bg-primary/80 text-white rounded-none px-8 py-6 h-auto text-sm tracking-widest uppercase font-bold shadow-[0_0_20px_-5px_rgba(139,92,246,0.5)] transition-all hover:shadow-[0_0_30px_-5px_rgba(139,92,246,0.8)]">
            Initialize
          </Button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center pt-20 overflow-hidden">
        {/* Background Image & Overlay */}
        <div className="absolute inset-0 z-0">
          <img 
            src="/hero-bg.png" 
            alt="Deep space nebula" 
            className="w-full h-full object-cover object-center opacity-40 mix-blend-screen"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/80 to-background" />
          <div className="absolute inset-0 bg-gradient-to-r from-background via-transparent to-background" />
        </div>

        {/* Abstract Background Glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/10 rounded-full blur-[120px] pointer-events-none z-0" />
        
        <motion.div 
          style={{ opacity, scale }}
          className="relative z-10 container mx-auto px-6 flex flex-col items-center text-center mt-12"
        >
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
            className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-white/5 border border-white/10 mb-10 backdrop-blur-sm"
          >
            <span className="flex h-2 w-2 rounded-full bg-primary animate-pulse shadow-[0_0_8px_rgba(139,92,246,0.8)]" />
            <span className="text-[10px] font-bold tracking-[0.2em] text-white/80 uppercase">SYSTEM ONLINE v2.4</span>
          </motion.div>

          <motion.h1 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            className="text-5xl md:text-7xl lg:text-9xl font-bold tracking-tighter max-w-6xl leading-[1.1] text-white drop-shadow-2xl"
          >
            Intelligence that sees <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-blue-400 to-primary/80 animate-gradient-x">beyond the horizon.</span>
          </motion.h1>

          <motion.p 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="mt-8 text-lg md:text-2xl text-muted-foreground/80 max-w-3xl font-light tracking-wide"
          >
            ASTRA.AI is the next-generation cognitive engine. Deeply powerful, impossibly quiet. 
            Built for when the stakes are highest and clarity is absolute.
          </motion.p>

          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="mt-16 flex flex-col sm:flex-row items-center gap-6"
          >
            <Button size="lg" className="rounded-none bg-white text-black hover:bg-white/90 px-10 h-16 text-sm tracking-[0.1em] font-bold uppercase group">
              Commence Uplink
              <ChevronRight className="ml-3 w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Button>
            <Button size="lg" variant="outline" className="rounded-none px-10 h-16 border-white/10 hover:bg-white/5 text-sm tracking-[0.1em] font-bold uppercase bg-background/50 backdrop-blur-sm">
              Read Manifesto
            </Button>
          </motion.div>
        </motion.div>
      </section>

      {/* Trust Banner */}
      <section className="py-12 border-y border-white/5 bg-white/[0.02]">
        <div className="container mx-auto px-6">
          <p className="text-center text-xs font-bold tracking-[0.2em] text-muted-foreground uppercase mb-8">Deployed in high-stakes environments</p>
          <div className="flex flex-wrap justify-center gap-12 md:gap-24 opacity-40 grayscale">
             {/* Abstract tech names instead of real logos to fit the vibe */}
             <span className="font-mono text-xl tracking-widest font-bold">NEXUS_</span>
             <span className="font-mono text-xl tracking-widest font-bold">STELLAR</span>
             <span className="font-mono text-xl tracking-widest font-bold">VOID.CORP</span>
             <span className="font-mono text-xl tracking-widest font-bold">AEON</span>
             <span className="font-mono text-xl tracking-widest font-bold">QUANTUM</span>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="capabilities" className="py-32 relative">
        <div className="container mx-auto px-6 max-w-7xl">
          <motion.div 
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="flex flex-col md:flex-row gap-12 justify-between items-end mb-24"
          >
            <div>
              <h2 className="text-4xl md:text-6xl font-bold tracking-tighter leading-tight">Quiet Power. <br/><span className="text-primary/80">Absolute Precision.</span></h2>
            </div>
            <p className="text-muted-foreground max-w-md text-xl font-light">
              We stripped away the noise to build an intelligence engine that operates with surgical accuracy in the dark.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { icon: Zap, title: "Warp-Speed Cognition", desc: "Processes complex datasets in milliseconds. ASTRA thinks faster so you can act sooner." },
              { icon: BrainCircuit, title: "Deep Synthesis", desc: "Connects unseen dots across vast information landscapes, revealing insights hidden in the void." },
              { icon: Shield, title: "Void-Level Security", desc: "Your data vanishes into a cryptographic void. Only you hold the absolute keys to its retrieval." }
            ].map((feature, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.8, delay: i * 0.1, ease: "easeOut" }}
                whileHover={{ y: -10 }}
                className="bg-white/[0.02] border border-white/5 p-10 rounded-none relative overflow-hidden group hover:border-primary/30 transition-all duration-500"
              >
                <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <feature.icon className="w-10 h-10 text-primary mb-8 opacity-70 group-hover:opacity-100 group-hover:scale-110 transition-all duration-500" />
                <h3 className="text-2xl font-bold mb-4 tracking-tight">{feature.title}</h3>
                <p className="text-muted-foreground leading-relaxed font-light text-lg">
                  {feature.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Showcase 1: Intelligence */}
      <section id="intelligence" className="py-32 relative overflow-hidden">
        <div className="container mx-auto px-6 max-w-7xl">
          <div className="flex flex-col lg:flex-row items-center gap-16">
            <motion.div 
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.8 }}
              className="lg:w-1/2"
            >
              <span className="text-primary font-bold tracking-[0.2em] text-xs uppercase mb-4 block">01 / Deep Synthesis</span>
              <h2 className="text-4xl md:text-5xl font-bold tracking-tighter mb-6">See the patterns <br/>others miss.</h2>
              <p className="text-muted-foreground text-xl font-light mb-8 leading-relaxed">
                ASTRA doesn't just process data—it understands context. By mapping multidimensional relationships in real-time, it surfaces insights that traditional systems leave buried in the noise.
              </p>
              <ul className="space-y-4">
                {['Neural pattern recognition', 'Contextual gap analysis', 'Predictive modeling engine'].map((item, i) => (
                  <li key={i} className="flex items-center gap-3 text-white/80 font-medium">
                    <Activity className="w-5 h-5 text-primary" />
                    {item}
                  </li>
                ))}
              </ul>
            </motion.div>
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 1 }}
              className="lg:w-1/2 relative"
            >
              <div className="absolute inset-0 bg-primary/20 blur-[100px] rounded-full" />
              <img 
                src="/feature-data.png" 
                alt="Abstract data visualization" 
                className="relative z-10 w-full h-auto object-cover rounded-none border border-white/10 shadow-2xl"
              />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Showcase 2: Speed */}
      <section className="py-32 relative overflow-hidden bg-white/[0.01]">
        <div className="container mx-auto px-6 max-w-7xl">
          <div className="flex flex-col lg:flex-row-reverse items-center gap-16">
            <motion.div 
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.8 }}
              className="lg:w-1/2"
            >
              <span className="text-primary font-bold tracking-[0.2em] text-xs uppercase mb-4 block">02 / Warp Speed</span>
              <h2 className="text-4xl md:text-5xl font-bold tracking-tighter mb-6">Immediate answers.<br/>Zero latency.</h2>
              <p className="text-muted-foreground text-xl font-light mb-8 leading-relaxed">
                Powered by a custom silicon architecture, ASTRA processes massive payloads with near-zero latency. When decisions need to be made in microseconds, ASTRA delivers.
              </p>
              <ul className="space-y-4">
                {['Sub-millisecond response', 'Distributed edge nodes', 'Infinite scaling capacity'].map((item, i) => (
                  <li key={i} className="flex items-center gap-3 text-white/80 font-medium">
                    <Network className="w-5 h-5 text-primary" />
                    {item}
                  </li>
                ))}
              </ul>
            </motion.div>
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 1 }}
              className="lg:w-1/2 relative"
            >
              <div className="absolute inset-0 bg-blue-500/20 blur-[100px] rounded-full" />
              <img 
                src="/feature-speed.png" 
                alt="Abstract light beams" 
                className="relative z-10 w-full h-auto object-cover rounded-none border border-white/10 shadow-2xl"
              />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Showcase 3: Security */}
      <section id="security" className="py-32 relative overflow-hidden">
        <div className="container mx-auto px-6 max-w-7xl">
          <div className="flex flex-col lg:flex-row items-center gap-16">
            <motion.div 
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.8 }}
              className="lg:w-1/2"
            >
              <span className="text-primary font-bold tracking-[0.2em] text-xs uppercase mb-4 block">03 / Absolute Security</span>
              <h2 className="text-4xl md:text-5xl font-bold tracking-tighter mb-6">Impenetrable.<br/>By design.</h2>
              <p className="text-muted-foreground text-xl font-light mb-8 leading-relaxed">
                We treat your data like highly classified matter. Protected by quantum-resistant encryption and zero-knowledge architecture, your interactions with ASTRA remain absolutely dark to the outside world.
              </p>
              <ul className="space-y-4">
                {['Quantum-resistant protocols', 'Zero-knowledge proofs', 'Ephemeral memory nodes'].map((item, i) => (
                  <li key={i} className="flex items-center gap-3 text-white/80 font-medium">
                    <Fingerprint className="w-5 h-5 text-primary" />
                    {item}
                  </li>
                ))}
              </ul>
            </motion.div>
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 1 }}
              className="lg:w-1/2 relative"
            >
              <div className="absolute inset-0 bg-purple-500/20 blur-[100px] rounded-full" />
              <img 
                src="/feature-security.png" 
                alt="Glowing crystal shield" 
                className="relative z-10 w-full h-auto object-cover rounded-none border border-white/10 shadow-2xl"
              />
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-40 relative overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img 
            src="/hero-bg.png" 
            alt="Deep space nebula" 
            className="w-full h-full object-cover object-bottom opacity-30 mix-blend-screen scale-110"
          />
          <div className="absolute inset-0 bg-background/80 backdrop-blur-[2px]" />
        </div>
        
        <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-background z-0" />
        
        <div className="relative z-10 container mx-auto px-6 text-center max-w-4xl">
          <Lock className="w-12 h-12 text-primary mx-auto mb-8 opacity-80" />
          <h2 className="text-5xl md:text-7xl font-bold tracking-tighter mb-8 text-white drop-shadow-lg">Ready to see further?</h2>
          <p className="text-2xl text-white/70 font-light mb-12">
            Join the pioneers who are already mapping the future with ASTRA.AI.
          </p>
          <Button size="lg" className="bg-primary hover:bg-primary/90 text-white rounded-none px-12 h-20 text-lg font-bold tracking-[0.2em] uppercase group shadow-[0_0_40px_-10px_rgba(139,92,246,0.6)]">
            Request Access Protocol
            <ChevronRight className="ml-4 w-6 h-6 group-hover:translate-x-2 transition-transform" />
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-16 border-t border-white/10 bg-background relative z-10">
        <div className="container mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="flex items-center gap-3">
            <Sparkles className="w-5 h-5 text-primary" />
            <span className="font-bold tracking-[0.2em] text-sm uppercase text-white">ASTRA.AI</span>
          </div>
          
          <div className="flex gap-8 text-xs font-semibold tracking-widest uppercase text-muted-foreground">
            <a href="#" className="hover:text-white transition-colors">Manifesto</a>
            <a href="#" className="hover:text-white transition-colors">Documentation</a>
            <a href="#" className="hover:text-white transition-colors">Security</a>
            <a href="#" className="hover:text-white transition-colors">Terminal</a>
          </div>

          <div className="text-xs tracking-widest text-muted-foreground uppercase font-mono">
            SYS.STATUS // <span className="text-green-400">OPTIMAL</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
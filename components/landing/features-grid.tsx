import { Badge } from '@/components/ui/badge'
import { FileCheck2, MessageSquare, Layers, Star, CheckCircle, Search, Shield, Zap, Sparkles, Code2 } from 'lucide-react'

export function FeaturesGrid() {
  const highlights = [
    {
      icon: Search,
      accent: 'from-blue-500 to-indigo-600',
      title: 'Smart Task Discovery Engine',
      description: 'Instant real-time search with granular filters for category, budget ranges, technology stacks, and skill match tags.',
      perk: 'Filters 50+ Tech Categories'
    },
    {
      icon: FileCheck2,
      accent: 'from-emerald-500 to-teal-600',
      title: 'Automated Legal Contracts',
      description: 'Zero manual paperwork. Instantly generate binding PDF assignment contracts with digital multi-party signatures.',
      perk: 'Instant PDF Generation'
    },
    {
      icon: Layers,
      accent: 'from-purple-500 to-pink-600',
      title: 'Milestone-Based Escrow Tracking',
      description: 'Deconstruct projects into clear deliverable milestones with progress indicators and structured approval checkpoints.',
      perk: 'Protected Payment Flow'
    },
    {
      icon: MessageSquare,
      accent: 'from-amber-500 to-orange-600',
      title: 'Real-Time Socket Messaging',
      description: 'Direct messaging between enterprises and students powered by Socket.IO with instant notification badges.',
      perk: 'Live Socket.IO Integration'
    },
    {
      icon: Star,
      accent: 'from-rose-500 to-red-600',
      title: 'Mutual 5-Star Reputation System',
      description: 'Exchange verified performance reviews and star ratings upon task completion to build long-term trust.',
      perk: 'Verified Client Reviews'
    },
    {
      icon: CheckCircle,
      accent: 'from-cyan-500 to-blue-600',
      title: 'Verified Student Portfolios',
      description: 'Detailed student profiles showcasing university background, skill matrix, past work, and resume PDF downloads.',
      perk: 'Direct Resume Uploads'
    },
  ]

  return (
    <section className="py-24 bg-muted/20 border-t relative overflow-hidden">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="max-w-3xl mb-16 text-center sm:text-left">
          <Badge variant="secondary" className="px-3 py-1 rounded-full text-xs font-semibold mb-3">
            <Sparkles className="h-3.5 w-3.5 mr-1.5 inline text-primary" /> Enterprise Feature Architecture
          </Badge>
          <h2 className="text-3xl sm:text-5xl font-black tracking-tight mb-4">
            Built for High-Performance Teams & Ambitious Students
          </h2>
          <p className="text-muted-foreground text-sm sm:text-base leading-relaxed">
            Everything required to publish tasks, evaluate candidates, execute legal contracts, and deliver quality project outcomes.
          </p>
        </div>

        {/* Asymmetric Split Feature Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {highlights.map((item, idx) => {
            const Icon = item.icon
            return (
              <div 
                key={idx} 
                className="group relative rounded-2xl bg-card border shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col justify-between hover:-translate-y-1 hover:border-primary/40"
              >
                {/* Top accent bar */}
                <div className={`h-1.5 w-full bg-gradient-to-r ${item.accent}`} />

                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className={`h-12 w-12 rounded-xl bg-gradient-to-tr ${item.accent} text-white flex items-center justify-center shadow-md`}>
                      <Icon className="h-6 w-6" />
                    </div>
                    <Badge variant="outline" className="text-[10px] font-mono uppercase bg-muted/40">
                      {item.perk}
                    </Badge>
                  </div>

                  <h3 className="text-lg font-bold mb-2 group-hover:text-primary transition-colors">
                    {item.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                    {item.description}
                  </p>
                </div>

                <div className="px-6 py-3 bg-muted/30 border-t text-[11px] font-semibold text-muted-foreground flex items-center gap-1.5">
                  <Shield className="h-3.5 w-3.5 text-primary" />
                  <span>Production-Ready Feature</span>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowRight } from 'lucide-react'

export function StatsSection() {
  const stats = [
    { label: 'Active University Tasks', value: '500+' },
    { label: 'Total Student Earnings', value: '$1.2M+' },
    { label: 'Contract Generation Speed', value: '< 2s' },
    { label: 'Client Satisfaction', value: '99.4%' },
  ]

  return (
    <section className="py-12 sm:py-20 border-t bg-background relative overflow-hidden">
      <div className="container mx-auto px-4">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-8 mb-12 sm:mb-20 text-center">
          {stats.map((stat, idx) => (
            <div key={idx} className="p-4 sm:p-6 rounded-2xl bg-muted/20 border border-border/40">
              <div className="text-2xl sm:text-4xl font-black tracking-tight text-primary mb-1 sm:mb-2">
                {stat.value}
              </div>
              <div className="text-xs sm:text-sm font-medium text-muted-foreground">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Bottom CTA Banner */}
        <div className="relative rounded-2xl sm:rounded-3xl bg-gradient-to-r from-primary via-purple-600 to-emerald-500 p-6 sm:p-12 text-white shadow-2xl overflow-hidden">
          <div className="relative z-10 max-w-2xl">
            <h3 className="text-xl sm:text-4xl font-extrabold tracking-tight mb-3 sm:mb-4">
              Ready to post your first task or find exciting student projects?
            </h3>
            <p className="text-white/80 text-xs sm:text-base mb-6 sm:mb-8 leading-relaxed">
              Join hundreds of enterprise companies and skilled university developers today.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link href="/login" className="w-full sm:w-auto">
                <Button size="lg" variant="secondary" className="w-full sm:w-auto font-bold text-primary hover:bg-white text-xs sm:text-sm h-10 sm:h-11">
                  Join Platform Now
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

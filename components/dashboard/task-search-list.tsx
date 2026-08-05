'use client'

import { useState, useMemo } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Search, Filter, DollarSign, ArrowRight, CheckCircle2, Sparkles, Building2, MessageSquare } from 'lucide-react'


interface TaskSearchListProps {
  tasks: Array<{
    id: string
    title: string
    description: string
    budget: number
    category: string
    status: string
    requiredSkills: string[] | null
    enterpriseId: string
  }>
  enterpriseMap: Record<string, string>
  enterpriseUserIdMap?: Record<string, string>
  appliedTaskIds: string[]
}

export function TaskSearchList({ tasks, enterpriseMap, enterpriseUserIdMap, appliedTaskIds }: TaskSearchListProps) {

  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [budgetRange, setBudgetRange] = useState('all')
  const [customMinBudget, setCustomMinBudget] = useState('')

  const appliedSet = useMemo(() => new Set(appliedTaskIds), [appliedTaskIds])

  const categories = useMemo(() => {
    const set = new Set<string>()
    tasks.forEach(t => {
      if (t.category) set.add(t.category)
    })
    return Array.from(set)
  }, [tasks])

  const filteredTasks = useMemo(() => {
    return tasks.filter(task => {
      // Search term (title, description, skills)
      const query = searchTerm.toLowerCase().trim()
      const matchesSearch = !query ||
        task.title.toLowerCase().includes(query) ||
        task.description.toLowerCase().includes(query) ||
        task.category.toLowerCase().includes(query) ||
        task.requiredSkills?.some(s => s.toLowerCase().includes(query))

      // Category filter
      const matchesCategory = selectedCategory === 'all' || task.category === selectedCategory

      // Budget filter logic
      let matchesBudget = true
      const taskBudget = Number(task.budget)

      if (customMinBudget) {
        const min = parseInt(customMinBudget, 10)
        if (!isNaN(min)) {
          matchesBudget = taskBudget >= min
        }
      } else if (budgetRange !== 'all') {
        if (budgetRange === '0-500') matchesBudget = taskBudget >= 0 && taskBudget <= 500
        else if (budgetRange === '500-1000') matchesBudget = taskBudget > 500 && taskBudget <= 1000
        else if (budgetRange === '1000-5000') matchesBudget = taskBudget > 1000 && taskBudget <= 5000
        else if (budgetRange === '5000+') matchesBudget = taskBudget > 5000
      }

      return matchesSearch && matchesCategory && matchesBudget
    })
  }, [tasks, searchTerm, selectedCategory, budgetRange, customMinBudget])

  return (
    <div className="space-y-6">
      {/* Shadcn UI Styled Filter Bar */}
      <Card className="border-primary/20 bg-card/50 backdrop-blur shadow-md p-4">
        <div className="grid gap-4 md:grid-cols-4 items-center">
          {/* Search Input */}
          <div className="relative md:col-span-1">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search tasks, skills..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 bg-background/80"
            />
          </div>

          {/* Category Select */}
          <div className="relative">
            <Filter className="absolute left-3 top-3 h-4 w-4 text-muted-foreground pointer-events-none z-10" />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="flex h-10 w-full rounded-md border border-input bg-background/80 pl-9 pr-4 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring cursor-pointer appearance-none"
            >
              <option value="all">All Categories</option>
              {categories.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          {/* Budget Preset Filter */}
          <div className="relative">
            <DollarSign className="absolute left-3 top-3 h-4 w-4 text-muted-foreground pointer-events-none z-10" />
            <select
              value={budgetRange}
              onChange={(e) => {
                setBudgetRange(e.target.value)
                setCustomMinBudget('')
              }}
              className="flex h-10 w-full rounded-md border border-input bg-background/80 pl-9 pr-4 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring cursor-pointer appearance-none"
            >
              <option value="all">Any Budget</option>
              <option value="0-500">$0 – $500</option>
              <option value="500-1000">$500 – $1,000</option>
              <option value="1000-5000">$1,000 – $5,000</option>
              <option value="5000+">$5,000+</option>
            </select>
          </div>

          {/* Custom Min Budget Input */}
          <div className="relative">
            <DollarSign className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              type="number"
              placeholder="Min Budget ($)..."
              value={customMinBudget}
              onChange={(e) => {
                setCustomMinBudget(e.target.value)
                setBudgetRange('all')
              }}
              className="pl-9 bg-background/80"
            />
          </div>
        </div>
      </Card>

      {/* Task Count Indicator */}
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <span>Showing <strong>{filteredTasks.length}</strong> available tasks</span>
        {(searchTerm || selectedCategory !== 'all' || budgetRange !== 'all' || customMinBudget) && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setSearchTerm('')
              setSelectedCategory('all')
              setBudgetRange('all')
              setCustomMinBudget('')
            }}
            className="text-xs text-primary hover:underline h-auto p-0"
          >
            Clear all filters
          </Button>
        )}
      </div>

      {/* Tasks Grid */}
      {filteredTasks.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="p-12 text-center space-y-3">
            <Sparkles className="h-10 w-10 text-muted-foreground mx-auto" />
            <h3 className="text-lg font-semibold">No tasks matched your criteria</h3>
            <p className="text-sm text-muted-foreground">
              Try broadening your search terms or clearing your category and budget filters.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredTasks.map((task) => {
            const isApplied = appliedSet.has(task.id)
            const enterpriseUserId = enterpriseUserIdMap ? enterpriseUserIdMap[task.enterpriseId] : undefined

            return (
              <div
                key={task.id}
                onClick={() => router.push(`/dashboard/tasks/${task.id}`)}
                className="block group cursor-pointer"
              >
                <Card className="h-full flex flex-col transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:border-primary/60 border bg-card/60 backdrop-blur relative overflow-hidden">
                  {/* Subtle hover accent bar */}
                  <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary to-emerald-500 opacity-0 group-hover:opacity-100 transition-opacity" />

                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start gap-2">
                      <Badge variant="outline" className="text-[11px] font-normal truncate">
                        {task.category}
                      </Badge>
                      <span className="font-bold text-base text-emerald-500 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
                        ${task.budget.toLocaleString()}
                      </span>
                    </div>

                    <CardTitle className="text-lg font-bold line-clamp-1 group-hover:text-primary transition-colors pt-2">
                      {task.title}
                    </CardTitle>

                    <CardDescription className="text-xs flex items-center gap-1.5 text-muted-foreground">
                      <Building2 className="h-3.5 w-3.5" />
                      <span className="truncate">{enterpriseMap[task.enterpriseId] || 'Enterprise Client'}</span>
                    </CardDescription>
                  </CardHeader>

                  <CardContent className="flex-1 pb-4">
                    <p className="text-sm text-muted-foreground line-clamp-3 mb-4 leading-relaxed">
                      {task.description}
                    </p>

                    <div className="flex flex-wrap gap-1.5 mt-auto">
                      {task.requiredSkills?.slice(0, 4).map((skill) => (
                        <Badge key={skill} variant="secondary" className="text-[10px] px-2 py-0">
                          {skill}
                        </Badge>
                      ))}
                      {task.requiredSkills && task.requiredSkills.length > 4 && (
                        <span className="text-[10px] text-muted-foreground self-center">
                          +{task.requiredSkills.length - 4} more
                        </span>
                      )}
                    </div>
                  </CardContent>

                  <CardFooter className="border-t pt-3 bg-muted/20 flex justify-between items-center text-xs gap-2">
                    <div className="flex items-center gap-2">
                      {enterpriseUserId && (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          title="Send Direct Message to Company"
                          className="h-8 w-8 p-0 text-primary hover:bg-primary/10"
                          onClick={(e) => {
                            e.stopPropagation()
                            router.push(`/dashboard/messages?recipientId=${enterpriseUserId}`)
                          }}
                        >
                          <MessageSquare className="h-4 w-4" />
                        </Button>
                      )}

                      {isApplied ? (
                        <span className="text-emerald-500 font-semibold flex items-center gap-1">
                          <CheckCircle2 className="h-4 w-4" /> Applied
                        </span>
                      ) : (
                        <span className="text-muted-foreground group-hover:text-foreground font-medium hidden sm:inline">
                          View Details
                        </span>
                      )}
                    </div>

                    <Button 
                      size="sm" 
                      variant={isApplied ? 'secondary' : 'default'} 
                      className="gap-1 text-xs"
                      onClick={(e) => {
                        e.stopPropagation()
                        router.push(`/dashboard/tasks/${task.id}`)
                      }}
                    >
                      {isApplied ? 'View Status' : 'Apply Now'}
                      <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                    </Button>
                  </CardFooter>
                </Card>
              </div>
            )
          })}

        </div>
      )}
    </div>
  )
}


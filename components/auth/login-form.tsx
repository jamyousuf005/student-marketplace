'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import * as z from 'zod'
import { login, signup } from '@/actions/auth'

import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'

const formSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  role: z.enum(['student', 'enterprise']).optional(),
})

export function LoginForm() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [activeTab, setActiveTab] = useState('login')

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: 'dummy@example.com',
      password: '',
      role: 'student',
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true)
    
    const formData = new FormData()
    formData.append('email', values.email)
    formData.append('password', values.password)
    
    const isSignUp = activeTab === 'signup'
    
    if (isSignUp) {
      if (!values.role) {
        toast.error('Please select an account type')
        setIsLoading(false)
        return
      }
      formData.append('role', values.role)
    }
    
    try {
      const result = isSignUp ? await signup(formData) : await login(formData)
      
      if (result?.error) {
        toast.error(result.error)
      } else if (result?.success) {
        toast.success(isSignUp ? 'Account created successfully!' : 'Signed in successfully!')
        router.push('/dashboard')
        router.refresh()
      }
    } catch (error) {
      toast.error('An unexpected error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="w-[400px] shadow-lg border-muted">
      <Tabs defaultValue="login" className="w-full" onValueChange={setActiveTab}>
        <CardHeader>
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="login">Login</TabsTrigger>
            <TabsTrigger value="signup">Sign Up</TabsTrigger>
          </TabsList>
          <CardTitle className="text-2xl text-center">
            {activeTab === 'login' ? 'Welcome back' : 'Create an account'}
          </CardTitle>
          <CardDescription className="text-center">
            {activeTab === 'login' 
              ? 'Enter your credentials to access your account' 
              : 'Sign up to start collaborating on the marketplace'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form className="space-y-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input placeholder="name@example.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="••••••••" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {activeTab === 'signup' && (
                <FormField
                  control={form.control}
                  name="role"
                  render={({ field }) => (
                    <FormItem className="space-y-3">
                      <FormLabel>Account Type</FormLabel>
                      <FormControl>
                        <RadioGroup
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          className="flex flex-col space-y-1"
                        >
                          <FormItem className="flex items-center space-x-3 space-y-0">
                            <FormControl>
                              <RadioGroupItem value="student" />
                            </FormControl>
                            <FormLabel className="font-normal">
                              Student - I want to find tasks
                            </FormLabel>
                          </FormItem>
                          <FormItem className="flex items-center space-x-3 space-y-0">
                            <FormControl>
                              <RadioGroupItem value="enterprise" />
                            </FormControl>
                            <FormLabel className="font-normal">
                              Enterprise - I want to post tasks
                            </FormLabel>
                          </FormItem>
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
            </form>
          </Form>
        </CardContent>
        <CardFooter>
          <Button 
            className="w-full" 
            onClick={form.handleSubmit(onSubmit)}
            disabled={isLoading}
          >
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {activeTab === 'login' ? 'Sign In' : 'Create Account'}
          </Button>
        </CardFooter>
      </Tabs>
    </Card>
  )
}

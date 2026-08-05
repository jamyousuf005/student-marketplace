'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import * as z from 'zod'
import { login, signup, verifyOtp } from '@/actions/auth'
import { createClient } from '@/supabase/client'
import { IconBrandGoogle } from '@tabler/icons-react'

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
  const [isGoogleLoading, setIsGoogleLoading] = useState(false)
  const [activeTab, setActiveTab] = useState('login')
  const supabase = createClient()

  const [verificationEmail, setVerificationEmail] = useState<string | null>(null)
  const [otpCode, setOtpCode] = useState('')
  const [isVerifying, setIsVerifying] = useState(false)

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
      
      // Typescript complains about needsVerification not existing if we don't handle it carefully
      // but it exists on the signup response
      const hasNeedsVerification = result && 'needsVerification' in result && result.needsVerification;
      
      if (hasNeedsVerification) {
        toast.success('Verification code sent to your email!')
        setVerificationEmail(values.email)
      } else if (result?.error) {
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

  async function handleGoogleLogin() {
    setIsGoogleLoading(true)
    
    // Store role choice if on signup tab, so the callback can properly register them
    if (activeTab === 'signup') {
      const role = form.getValues('role') || 'student'
      document.cookie = `oauth_role=${role}; path=/; max-age=3600; SameSite=Lax`
    }

    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      }
    })

    if (error) {
      toast.error(error.message)
      setIsGoogleLoading(false)
    }
  }

  async function handleVerifyOtp(e: React.FormEvent) {
    e.preventDefault()
    if (!otpCode || otpCode.length !== 6) {
      toast.error('Please enter a valid 6-digit code')
      return
    }

    setIsVerifying(true)
    try {
      const result = await verifyOtp(verificationEmail!, otpCode)
      if (result.error) {
        toast.error(result.error)
      } else {
        toast.success('Email verified successfully!')
        router.push('/dashboard')
        router.refresh()
      }
    } catch (error) {
      toast.error('Verification failed')
    } finally {
      setIsVerifying(false)
    }
  }

  if (verificationEmail) {
    return (
      <Card className="w-[400px] shadow-lg border-muted">
        <CardHeader>
          <CardTitle className="text-2xl text-center">Verify Email</CardTitle>
          <CardDescription className="text-center">
            We sent a 6-digit verification code to <br/>
            <span className="font-semibold text-foreground">{verificationEmail}</span>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleVerifyOtp} className="space-y-4">
            <div className="space-y-2">
              <Input
                type="text"
                placeholder="123456"
                maxLength={6}
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                className="text-center text-lg tracking-widest"
              />
            </div>
            <Button 
              type="submit" 
              className="w-full"
              disabled={isVerifying || otpCode.length !== 6}
            >
              {isVerifying && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Verify Code
            </Button>
            <Button 
              type="button"
              variant="ghost" 
              className="w-full"
              onClick={() => setVerificationEmail(null)}
              disabled={isVerifying}
            >
              Back to login
            </Button>
          </form>
        </CardContent>
      </Card>
    )
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
                          value={field.value}
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
        <CardFooter className="flex flex-col gap-4">
          <Button 
            className="w-full" 
            onClick={form.handleSubmit(onSubmit)}
            disabled={isLoading || isGoogleLoading}
          >
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {activeTab === 'login' ? 'Sign In' : 'Create Account'}
          </Button>

          <div className="relative w-full">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-2 text-muted-foreground">
                Or continue with
              </span>
            </div>
          </div>

          <Button 
            variant="outline" 
            type="button"
            className="w-full flex items-center justify-center gap-2 bg-background hover:bg-accent text-foreground transition-all duration-300"
            onClick={handleGoogleLogin}
            disabled={isLoading || isGoogleLoading}
          >
            {isGoogleLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <IconBrandGoogle className="h-4 w-4" />
            )}
            Google
          </Button>
        </CardFooter>
      </Tabs>
    </Card>
  )
}

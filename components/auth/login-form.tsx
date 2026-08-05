'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import * as z from 'zod'
import { motion, AnimatePresence } from 'framer-motion'
import { login, signup, verifyOtp, requestPasswordReset, verifyResetOtp, resetPassword } from '@/actions/auth'
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
import { toast } from 'sonner'
import { 
  Loader2, 
  GraduationCap, 
  Building2, 
  Check, 
  Eye, 
  EyeOff, 
  Sparkles, 
  ArrowRight,
  ShieldCheck,
  Lock,
  Mail,
  KeyRound,
  CheckCircle2,
  AlertCircle,
  ArrowLeft
} from 'lucide-react'

import { Label } from '@/components/ui/label'

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
  const [showPassword, setShowPassword] = useState(false)
  const supabase = createClient()

  const [verificationEmail, setVerificationEmail] = useState<string | null>(null)
  const [otpCode, setOtpCode] = useState('')
  const [isVerifying, setIsVerifying] = useState(false)

  // Forgot Password State
  const [isForgotPasswordView, setIsForgotPasswordView] = useState(false)
  const [forgotStep, setForgotStep] = useState<'email' | 'otp' | 'password'>('email')
  const [forgotEmail, setForgotEmail] = useState('')
  const [isForgotLoading, setIsForgotLoading] = useState(false)
  const [forgotSuccess, setForgotSuccess] = useState(false)
  const [forgotError, setForgotError] = useState<string | null>(null)
  const [resetOtp, setResetOtp] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmNewPassword, setConfirmNewPassword] = useState('')
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [otpDigits, setOtpDigits] = useState<string[]>(['', '', '', '', '', ''])
  const otpRefs = [
    React.useRef<HTMLInputElement>(null),
    React.useRef<HTMLInputElement>(null),
    React.useRef<HTMLInputElement>(null),
    React.useRef<HTMLInputElement>(null),
    React.useRef<HTMLInputElement>(null),
    React.useRef<HTMLInputElement>(null),
  ]

  const resetForgotPasswordState = () => {
    setIsForgotPasswordView(false)
    setForgotStep('email')
    setForgotEmail('')
    setForgotSuccess(false)
    setForgotError(null)
    setResetOtp('')
    setOtpDigits(['', '', '', '', '', ''])
    setNewPassword('')
    setConfirmNewPassword('')
    setShowNewPassword(false)
  }


  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
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
      const hasNeedsVerification = result && 'needsVerification' in result && result.needsVerification
      
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

  const handleForgotPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setForgotError(null)

    if (!forgotEmail || !forgotEmail.includes('@')) {
      setForgotError('Please enter a valid email address.')
      return
    }

    setIsForgotLoading(true)
    try {
      const res = await requestPasswordReset(forgotEmail)
      if (res && 'error' in res && res.error) {
        const rawErr = res.error
        const errorMsg = typeof rawErr === 'string' && rawErr.trim()
          ? rawErr
          : (rawErr as any)?.message || 'Failed to send verification code. Please try again.'
        setForgotError(errorMsg)
      } else {
        setForgotStep('otp')
        setResetOtp('')
        toast.success('Verification code sent to your email!')
      }
    } catch (err: any) {
      setForgotError(err?.message || 'Failed to send verification code. Please try again.')
    } finally {
      setIsForgotLoading(false)
    }
  }

  const handleResendCode = async () => {
    setForgotError(null)
    setIsForgotLoading(true)
    try {
      const res = await requestPasswordReset(forgotEmail)
      if (res && 'error' in res && res.error) {
        setForgotError(typeof res.error === 'string' ? res.error : 'Failed to resend code.')
      } else {
        toast.success('Verification code resent!')
      }
    } catch (err: any) {
      setForgotError(err?.message || 'Failed to resend code.')
    } finally {
      setIsForgotLoading(false)
    }
  }

  const handleVerifyResetOtp = async (e: React.FormEvent) => {
    e.preventDefault()
    setForgotError(null)

    if (!resetOtp || resetOtp.trim().length < 4) {
      setForgotError('Please enter the verification code from your email.')
      return
    }


    setIsForgotLoading(true)
    try {
      const res = await verifyResetOtp(forgotEmail, resetOtp)
      if (res && 'error' in res && res.error) {
        setForgotError(res.error)
      } else {
        setForgotStep('password')
        toast.success('Code verified! Set your new password.')
      }
    } catch (err: any) {
      setForgotError(err?.message || 'Verification failed. Please try again.')
    } finally {
      setIsForgotLoading(false)
    }
  }

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault()
    setForgotError(null)

    if (newPassword.length < 8) {
      setForgotError('Password must be at least 8 characters long.')
      return
    }

    if (newPassword !== confirmNewPassword) {
      setForgotError('Passwords do not match.')
      return
    }

    setIsForgotLoading(true)
    try {
      const res = await resetPassword(newPassword)
      if (res && 'error' in res && res.error) {
        setForgotError(res.error)
      } else {
        setForgotSuccess(true)
        toast.success('Password reset successfully!')
        setTimeout(() => {
          resetForgotPasswordState()
        }, 2500)
      }
    } catch (err: any) {
      setForgotError(err?.message || 'Failed to reset password. Please try again.')
    } finally {
      setIsForgotLoading(false)
    }
  }

  if (verificationEmail) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md"
      >
        <Card className="shadow-2xl border-primary/20 bg-card/80 backdrop-blur-xl">
          <CardHeader className="text-center space-y-2">
            <div className="h-12 w-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mx-auto mb-2">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <CardTitle className="text-2xl font-black">Verify Your Email</CardTitle>
            <CardDescription className="text-sm">
              We sent a 6-digit verification code to <br/>
              <span className="font-bold text-foreground">{verificationEmail}</span>
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleVerifyOtp} className="space-y-5">
              <div className="space-y-2">
                <Input
                  type="text"
                  placeholder="123456"
                  maxLength={6}
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                  className="text-center text-2xl tracking-[0.5em] font-mono h-12 bg-background/80"
                />
              </div>
              <Button 
                type="button"
                variant="ghost" 
                className="w-full text-xs text-muted-foreground"
                onClick={() => setVerificationEmail(null)}
                disabled={isVerifying}
              >
                Back to login
              </Button>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    )
  }

  if (isForgotPasswordView) {
    const steps = ['email', 'otp', 'password'] as const
    const stepIndex = steps.indexOf(forgotStep)

    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-md"
      >
        <Card className="shadow-2xl border-border/60 bg-card/80 backdrop-blur-xl relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-primary via-purple-500 to-emerald-400" />

          <CardHeader className="text-center pb-4 pt-6">
            {/* Step Icon */}
            <div className="mx-auto h-12 w-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mb-3">
              <AnimatePresence mode="wait">
                <motion.div
                  key={forgotStep}
                  initial={{ opacity: 0, scale: 0.7, rotate: -10 }}
                  animate={{ opacity: 1, scale: 1, rotate: 0 }}
                  exit={{ opacity: 0, scale: 0.7, rotate: 10 }}
                  transition={{ duration: 0.2 }}
                >
                  {forgotStep === 'email' && <KeyRound className="h-6 w-6" />}
                  {forgotStep === 'otp' && <ShieldCheck className="h-6 w-6" />}
                  {forgotStep === 'password' && <Lock className="h-6 w-6" />}
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Step Progress Dots */}
            {!forgotSuccess && (
              <div className="flex items-center justify-center gap-2 mb-3">
                {steps.map((step, i) => (
                  <div
                    key={step}
                    className={`h-1.5 rounded-full transition-all duration-300 ${
                      i === stepIndex
                        ? 'w-6 bg-primary'
                        : i < stepIndex
                        ? 'w-3 bg-primary/50'
                        : 'w-3 bg-muted'
                    }`}
                  />
                ))}
              </div>
            )}

            <AnimatePresence mode="wait">
              <motion.div
                key={forgotSuccess ? 'success' : forgotStep}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.2 }}
              >
                <CardTitle className="text-xl font-bold tracking-tight">
                  {forgotSuccess
                    ? 'Password Reset!'
                    : forgotStep === 'email'
                    ? 'Forgot Password?'
                    : forgotStep === 'otp'
                    ? 'Check Your Email'
                    : 'Set New Password'}
                </CardTitle>
                <CardDescription className="text-xs mt-1">
                  {forgotSuccess
                    ? 'You can now sign in with your new password.'
                    : forgotStep === 'email'
                    ? "Enter your email and we'll send a 6-digit verification code."
                    : forgotStep === 'otp'
                    ? <span>We sent a code to <span className="font-semibold text-foreground">{forgotEmail}</span>. Enter it below.</span>
                    : 'Your identity is verified. Choose a strong new password.'}
                </CardDescription>
              </motion.div>
            </AnimatePresence>
          </CardHeader>

          <CardContent>
            {forgotSuccess ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-center space-y-3"
              >
                <CheckCircle2 className="h-8 w-8 mx-auto text-emerald-500" />
                <div className="space-y-1">
                  <h4 className="font-bold text-sm">Password Reset Successfully!</h4>
                  <p className="text-xs text-muted-foreground">Redirecting you back to sign in...</p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={resetForgotPasswordState}
                  className="w-full text-xs font-semibold mt-2"
                >
                  <ArrowLeft className="h-3.5 w-3.5 mr-1" /> Back to Sign In
                </Button>
              </motion.div>
            ) : (
              <AnimatePresence mode="wait">
                <motion.div
                  key={forgotStep}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.2 }}
                >
                  {/* Shared Error Banner */}
                  {forgotError && (
                    <div className="mb-4 p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-xs flex items-center gap-2">
                      <AlertCircle className="h-4 w-4 shrink-0" />
                      <span>{forgotError}</span>
                    </div>
                  )}

                  {/* ── Step 1: Email ── */}
                  {forgotStep === 'email' && (
                    <form onSubmit={handleForgotPasswordSubmit} className="space-y-4">
                      <div className="space-y-1.5">
                        <Label className="text-xs font-semibold">Email Address</Label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                          <Input
                            type="email"
                            placeholder="user@example.com"
                            value={forgotEmail}
                            onChange={(e) => setForgotEmail(e.target.value)}
                            required
                            autoFocus
                            className="pl-9 h-11 bg-background/80"
                          />
                        </div>
                      </div>
                      <Button
                        type="submit"
                        disabled={isForgotLoading}
                        className="w-full h-11 font-bold bg-primary hover:bg-primary/90 shadow-md shadow-primary/20"
                      >
                        {isForgotLoading ? (
                          <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Sending Code...</>
                        ) : (
                          'Send Verification Code'
                        )}
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        onClick={resetForgotPasswordState}
                        className="w-full text-xs text-muted-foreground hover:text-foreground"
                      >
                        <ArrowLeft className="h-3.5 w-3.5 mr-1" /> Back to Sign In
                      </Button>
                    </form>
                  )}

                  {/* ── Step 2: OTP ── */}
                  {forgotStep === 'otp' && (
                    <form onSubmit={handleVerifyResetOtp} className="space-y-4">
                      <div className="space-y-2">
                        <Label className="text-xs font-semibold text-center block">
                          Verification Code
                        </Label>
                        <Input
                          type="text"
                          inputMode="numeric"
                          placeholder="••••••••"
                          maxLength={8}
                          value={resetOtp}
                          autoFocus
                          onChange={(e) => {
                            const val = e.target.value.replace(/\D/g, '').slice(0, 8)
                            setResetOtp(val)
                          }}
                          className="text-center text-3xl tracking-[0.4em] font-mono h-16 bg-background/80 border-2 focus:border-primary"
                        />
                        <p className="text-[10px] text-muted-foreground text-center">
                          Check your email — enter the full code exactly as received
                        </p>
                      </div>
                      <Button
                        type="submit"
                        disabled={isForgotLoading || resetOtp.length < 4}
                        className="w-full h-11 font-bold bg-primary hover:bg-primary/90 shadow-md shadow-primary/20"
                      >
                        {isForgotLoading ? (
                          <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Verifying...</>
                        ) : (
                          'Verify Code'
                        )}
                      </Button>
                      <div className="flex items-center justify-between text-xs pt-1">
                        <button
                          type="button"
                          onClick={() => { setForgotStep('email'); setForgotError(null); setResetOtp('') }}
                          className="text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
                        >
                          <ArrowLeft className="h-3 w-3" /> Wrong email?
                        </button>
                        <button
                          type="button"
                          disabled={isForgotLoading}
                          onClick={handleResendCode}
                          className="text-primary hover:underline font-semibold transition-colors disabled:opacity-50"
                        >
                          Resend Code
                        </button>
                      </div>
                    </form>
                  )}



                  {/* ── Step 3: New Password ── */}
                  {forgotStep === 'password' && (
                    <form onSubmit={handlePasswordReset} className="space-y-4">
                      <div className="space-y-1.5">
                        <Label className="text-xs font-semibold">New Password</Label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                          <Input
                            type={showNewPassword ? 'text' : 'password'}
                            placeholder="••••••••"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            required
                            minLength={8}
                            autoFocus
                            className="pl-9 pr-10 h-11 bg-background/80"
                          />
                          <button
                            type="button"
                            onClick={() => setShowNewPassword(!showNewPassword)}
                            className="absolute right-3 top-3 text-muted-foreground hover:text-foreground transition-colors"
                          >
                            {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </button>
                        </div>
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-xs font-semibold">Confirm New Password</Label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                          <Input
                            type={showNewPassword ? 'text' : 'password'}
                            placeholder="••••••••"
                            value={confirmNewPassword}
                            onChange={(e) => setConfirmNewPassword(e.target.value)}
                            required
                            className="pl-9 h-11 bg-background/80"
                          />
                        </div>
                      </div>
                      <Button
                        type="submit"
                        disabled={isForgotLoading}
                        className="w-full h-11 font-bold bg-primary hover:bg-primary/90 shadow-md shadow-primary/20"
                      >
                        {isForgotLoading ? (
                          <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Resetting Password...</>
                        ) : (
                          'Reset Password'
                        )}
                      </Button>
                    </form>
                  )}
                </motion.div>
              </AnimatePresence>
            )}
          </CardContent>
        </Card>
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="w-full max-w-md"
    >
      <Card className="shadow-2xl border-border/60 bg-card/80 backdrop-blur-xl relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-purple-500" />
        
        <Tabs defaultValue="login" className="w-full" onValueChange={setActiveTab}>
          <CardHeader className="pb-4">
            <TabsList className="grid w-full grid-cols-2 p-1 bg-muted/60 mb-3">
              <TabsTrigger value="login" className="text-xs sm:text-sm font-semibold">
                Sign In
              </TabsTrigger>
              <TabsTrigger value="signup" className="text-xs sm:text-sm font-semibold">
                Create Account
              </TabsTrigger>
            </TabsList>
            
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, x: activeTab === 'login' ? -10 : 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: activeTab === 'login' ? 10 : -10 }}
                transition={{ duration: 0.2 }}
                className="text-center"
              >
                <CardTitle className="text-2xl font-extrabold tracking-tight">
                  {activeTab === 'login' ? 'Welcome Back' : 'Join Marketplace'}
                </CardTitle>
                <CardDescription className="text-xs sm:text-sm mt-1">
                  {activeTab === 'login' 
                    ? 'Enter your credentials to access your dashboard' 
                    : 'Connect university talent with enterprise projects'}
                </CardDescription>
              </motion.div>
            </AnimatePresence>
          </CardHeader>

          <CardContent className="space-y-4">
            <Form {...form}>
              <form className="space-y-4">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-semibold">Email Address</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                          <Input placeholder="user@example.com" className="pl-9 h-11 bg-background/80" {...field} />
                        </div>
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
                      <FormLabel className="text-xs font-semibold">Password</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                          <Input 
                            type={showPassword ? 'text' : 'password'} 
                            placeholder="••••••••" 
                            className="pl-9 pr-10 h-11 bg-background/80" 
                            {...field} 
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-3 text-muted-foreground hover:text-foreground transition-colors"
                          >
                            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </button>
                        </div>
                      </FormControl>
                      {activeTab === 'login' && (
                        <div className="flex justify-end pt-1">
                          <button
                            type="button"
                            onClick={() => {
                              setIsForgotPasswordView(true)
                              setForgotEmail(form.getValues('email') || '')
                            }}
                            className="text-xs font-semibold text-primary hover:underline transition-colors"
                          >
                            Forgot Password?
                          </button>
                        </div>
                      )}
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Animated Role Cards for Signup */}
                {activeTab === 'signup' && (
                  <FormField
                    control={form.control}
                    name="role"
                    render={({ field }) => (
                      <FormItem className="space-y-2 pt-1">
                        <FormLabel className="text-xs font-semibold">Select Account Role</FormLabel>
                        <FormControl>
                          <div className="grid grid-cols-2 gap-3">
                            {/* Student Role Selection Card */}
                            <div
                              onClick={() => field.onChange('student')}
                              className={`cursor-pointer p-3 rounded-xl border-2 transition-all flex flex-col items-center text-center space-y-1.5 ${
                                field.value === 'student'
                                  ? 'border-primary bg-primary/10 shadow-md'
                                  : 'border-border/60 hover:border-primary/40 bg-background/50'
                              }`}
                            >
                              <div className={`h-9 w-9 rounded-full flex items-center justify-center ${
                                field.value === 'student' ? 'bg-primary text-white' : 'bg-muted text-muted-foreground'
                              }`}>
                                <GraduationCap className="h-5 w-5" />
                              </div>
                              <span className="text-xs font-bold">Student</span>
                              <span className="text-[10px] text-muted-foreground">Find tasks & build portfolio</span>
                            </div>

                            {/* Enterprise Role Selection Card */}
                            <div
                              onClick={() => field.onChange('enterprise')}
                              className={`cursor-pointer p-3 rounded-xl border-2 transition-all flex flex-col items-center text-center space-y-1.5 ${
                                field.value === 'enterprise'
                                  ? 'border-primary bg-primary/10 shadow-md'
                                  : 'border-border/60 hover:border-primary/40 bg-background/50'
                              }`}
                            >
                              <div className={`h-9 w-9 rounded-full flex items-center justify-center ${
                                field.value === 'enterprise' ? 'bg-primary text-white' : 'bg-muted text-muted-foreground'
                              }`}>
                                <Building2 className="h-5 w-5" />
                              </div>
                              <span className="text-xs font-bold">Enterprise</span>
                              <span className="text-[10px] text-muted-foreground">Post tasks & hire talent</span>
                            </div>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
              </form>
            </Form>
          </CardContent>

          <CardFooter className="flex flex-col gap-3 pt-2">
            <Button 
              className="w-full h-11 text-base font-bold bg-primary hover:bg-primary/90 shadow-xl shadow-primary/20 transition-transform active:scale-[0.99]" 
              onClick={form.handleSubmit(onSubmit)}
              disabled={isLoading || isGoogleLoading}
            >
              {isLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <>
                  {activeTab === 'login' ? 'Sign In to Dashboard' : 'Create Your Account'}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>

            <div className="relative w-full my-1">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-[10px] uppercase tracking-wider font-semibold">
                <span className="bg-card px-3 text-muted-foreground">
                  Or continue with
                </span>
              </div>
            </div>

            <Button 
              variant="outline" 
              type="button"
              className="w-full h-10 flex items-center justify-center gap-2.5 bg-background hover:bg-muted font-semibold text-xs border-border/80"
              onClick={handleGoogleLogin}
              disabled={isLoading || isGoogleLoading}
            >
              {isGoogleLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <IconBrandGoogle className="h-4 w-4 text-rose-500" />
              )}
              <span>Continue with Google</span>
            </Button>
          </CardFooter>
        </Tabs>
      </Card>
    </motion.div>
  )
}

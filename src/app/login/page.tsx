import GetInForm from '@/components/GetInForm'

export default function LoginPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-8">
      <div className="glass-panel p-8 max-w-md w-full">
        <h2 className="text-3xl font-bold mb-6 text-center">Get In</h2>
        <GetInForm />
      </div>
    </div>
  )
}
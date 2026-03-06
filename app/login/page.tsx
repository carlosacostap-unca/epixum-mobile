import LoginButton from "@/components/LoginButton";

export default function LoginPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-zinc-50 dark:bg-zinc-900 p-8">
      <div className="w-full max-w-md bg-white dark:bg-zinc-800 rounded-xl shadow-lg p-8 border border-zinc-200 dark:border-zinc-700">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-zinc-900 dark:text-white mb-2">Bienvenido</h1>
          <p className="text-zinc-500 dark:text-zinc-400">Inicia sesión para acceder al curso</p>
        </div>
        
        <div className="flex justify-center">
          <LoginButton />
        </div>
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";
import pb from "@/lib/pocketbase";
import { useRouter } from "next/navigation";

export default function LoginButton() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async () => {
    setLoading(true);
    try {
      const authData = await pb.collection("users").authWithOAuth2({ provider: "google" });
      
      // Si el usuario no tiene rol (primera vez), se lo asignamos
      if (!authData.record.role) {
        try {
          // Asignar rol de estudiante
          await pb.collection("users").update(authData.record.id, {
            role: "estudiante"
          });
          // Actualizar el modelo local con el nuevo rol
          authData.record.role = "estudiante";
          pb.authStore.save(pb.authStore.token, authData.record);
        } catch (err) {
          console.error("No se pudo asignar el rol automáticamente. Verifica las API Rules.", err);
        }
      }

      // Save the auth data to a cookie so the server can access it
      // The default exportToCookie() includes secure, httpOnly, sameSite, path, etc.
      // We set httpOnly: false so that we can read it on the client if needed, 
      // but primarily so we can set it via document.cookie.
      document.cookie = pb.authStore.exportToCookie({ httpOnly: false });

      // Redirect to home page
      router.push("/");
      router.refresh(); // Refresh to update server components
    } catch (error) {
      console.error("Login failed:", error);
      alert("Error al iniciar sesión con Google. Por favor intenta nuevamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleLogin}
      disabled={loading}
      className="flex items-center justify-center gap-3 px-6 py-3 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg shadow-sm hover:shadow-md transition-all text-zinc-700 dark:text-zinc-200 font-medium w-full sm:w-auto"
    >
      {loading ? (
        <span className="animate-spin h-5 w-5 border-2 border-zinc-500 border-t-transparent rounded-full"></span>
      ) : (
        <>
          <svg className="w-5 h-5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              fill="#4285F4"
            />
            <path
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              fill="#34A853"
            />
            <path
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              fill="#FBBC05"
            />
            <path
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              fill="#EA4335"
            />
          </svg>
          Iniciar sesión con Google
        </>
      )}
    </button>
  );
}

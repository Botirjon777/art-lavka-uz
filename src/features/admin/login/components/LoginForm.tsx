"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { FiMail, FiLock, FiLogIn, FiShield } from "react-icons/fi";

export default function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        toast.error("Неверный email или пароль");
      } else {
        toast.success("Вход выполнен успешно");
        router.push("/admin");
        router.refresh();
      }
    } catch (error) {
      toast.error("Произошла ошибка системы. Попробуйте позже.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] flex items-center justify-center p-6 bg-[radial-gradient(circle_at_top_right,var(--tw-gradient-stops))] from-purple-50 via-white to-white">
      <div className="w-full max-w-[480px]">
        {/* Logo / Brand Area */}
        <div className="flex flex-col items-center mb-10">
          <div className="w-20 h-20 bg-linear-to-tr from-[#8814B1] to-[#6A108A] rounded-[24px] flex items-center justify-center shadow-xl shadow-purple-200 mb-6 group hover:rotate-3 transition-transform">
             <FiShield className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl font-black text-gray-900 tracking-tight mb-2">Art Lavka</h1>
          <p className="text-gray-400 font-bold uppercase tracking-[0.2em] text-[10px]">Admin Intelligence Dashboard</p>
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-[40px] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.08)] border border-gray-100 p-10 relative overflow-hidden group">
          <div className="absolute top-0 left-0 w-full h-2 bg-linear-to-r from-[#8814B1] to-purple-400 opacity-0 group-hover:opacity-100 transition-opacity" />
          
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-1">Авторизация</h2>
            <p className="text-gray-400 text-sm font-medium">Введите данные для доступа к панели</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label htmlFor="email" className="block text-[11px] font-black uppercase tracking-widest text-gray-400 ml-1">Email Почта</label>
              <div className="relative group">
                <div className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-[#8814B1] transition-colors">
                  <FiMail className="w-5 h-5" />
                </div>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full pl-14 pr-6 py-5 bg-gray-50/50 border border-gray-100 rounded-[22px] focus:bg-white focus:ring-4 focus:ring-purple-50 focus:border-[#8814B1] outline-none transition-all font-bold text-gray-900 placeholder:text-gray-300"
                  placeholder="admin@artlavka.uz"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="password" title="Enter your password"  className="block text-[11px] font-black uppercase tracking-widest text-gray-400 ml-1">Секретный пароль</label>
              <div className="relative group">
                <div className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-[#8814B1] transition-colors">
                  <FiLock className="w-5 h-5" />
                </div>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full pl-14 pr-6 py-5 bg-gray-50/50 border border-gray-100 rounded-[22px] focus:bg-white focus:ring-4 focus:ring-purple-50 focus:border-[#8814B1] outline-none transition-all font-bold text-gray-900 placeholder:text-gray-300"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-4 py-5 bg-gray-900 hover:bg-[#8814B1] text-white font-black text-lg rounded-[24px] transition-all shadow-xl shadow-gray-200 hover:shadow-purple-200 disabled:opacity-50 disabled:grayscale disabled:scale-95 flex items-center justify-center gap-3 active:scale-95"
            >
              {isLoading ? (
                <div className="w-6 h-6 border-2 border-white/20 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <FiLogIn className="w-5 h-5" />
                  Войти в систему
                </>
              )}
            </button>
          </form>

          {/* Decorative Elements */}
          <div className="mt-10 pt-10 border-t border-gray-50 text-center">
             <p className="text-[10px] text-gray-300 font-bold uppercase tracking-widest">&copy; 2026 Art Lavka Uzbekistan</p>
          </div>
        </div>
        
        {/* Footer Link */}
        <div className="mt-8 text-center">
           <p className="text-sm font-medium text-gray-400">Вернуться на <a href="/" className="text-[#8814B1] font-bold hover:underline">главную страницу</a></p>
        </div>
      </div>
    </div>
  );
}

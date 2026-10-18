/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useFleet } from '../context/FleetContext';
import { OasisLogo } from '../components/common/OasisLogo';
import { Eye, EyeOff, Lock, Mail } from 'lucide-react';

export const LoginScreen: React.FC = () => {
  const { login, showToast } = useFleet();
  const [email, setEmail] = useState('administrador@eloasis.com.co');
  const [password, setPassword] = useState('••••••••••••');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [forgotModalOpen, setForgotModalOpen] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      showToast('Por favor ingresa tu correo corporativo', 'warning');
      return;
    }
    login(rememberMe);
  };

  const handleForgotSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotEmail) {
      showToast('Ingresa tu correo para restablecer la contraseña', 'warning');
      return;
    }
    setForgotModalOpen(false);
    showToast(`Instrucciones enviadas a ${forgotEmail}`, 'success');
  };

  return (
    <div className="min-h-screen bg-[#FFF8F2] flex flex-col justify-center px-5 py-8">
      <div className="w-full max-w-sm mx-auto">
        {/* Logo Card */}
        <div className="flex flex-col items-center mb-6 text-center">
          <OasisLogo size="md" showSlogan={false} className="mb-2 w-full" />
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#5A3825] text-white rounded-full text-[10px] font-black uppercase tracking-widest mt-1 shadow-2xs">
            <span>OASIS FLOTA</span>
            <span className="text-amber-300">·</span>
            <span className="text-amber-200 font-semibold">Acceso Administrativo</span>
          </div>
        </div>

        {/* Login Form Box */}
        <div className="bg-white rounded-3xl p-6 sm:p-7 shadow-xl shadow-stone-200/50 border border-stone-200/80">
          <div className="mb-5">
            <h3 className="text-lg font-bold text-[#5A3825]">Iniciar sesión</h3>
            <p className="text-xs text-stone-500 mt-0.5">
              Ingresa tus credenciales de administrador de flota
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email / Username field */}
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1.5">
                Correo o usuario corporativo
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="ejemplo@eloasis.com.co"
                  className="w-full pl-10 pr-3.5 py-3 rounded-xl border border-stone-200 text-stone-800 text-xs font-medium focus:outline-hidden focus:ring-2 focus:ring-[#F47B20] focus:border-transparent transition-all"
                  required
                />
              </div>
            </div>

            {/* Password field */}
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1.5">
                Contraseña
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-10 pr-10 py-3 rounded-xl border border-stone-200 text-stone-800 text-xs font-medium focus:outline-hidden focus:ring-2 focus:ring-[#F47B20] focus:border-transparent transition-all"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-stone-400 hover:text-stone-600 min-w-[40px] justify-center"
                  aria-label={showPassword ? 'Ocultar contraseña' : 'Ver contraseña'}
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Remember me & Forgot password */}
            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded-md border-stone-300 text-[#F47B20] focus:ring-[#F47B20] accent-[#F47B20]"
                />
                <span className="text-xs font-medium text-stone-600">Recordarme</span>
              </label>

              <button
                type="button"
                onClick={() => setForgotModalOpen(true)}
                className="text-xs font-bold text-[#F47B20] hover:text-[#E06810] hover:underline"
              >
                ¿Olvidaste tu contraseña?
              </button>
            </div>

            {/* Submit button */}
            <button
              type="submit"
              className="w-full mt-2 py-3.5 px-4 bg-[#F47B20] hover:bg-[#E06810] text-white font-extrabold text-sm rounded-xl shadow-lg shadow-[#F47B20]/25 active:scale-98 transition-all min-h-[48px] flex items-center justify-center cursor-pointer"
            >
              Iniciar sesión
            </button>
          </form>

          {/* Quick Access Helper */}
          <div className="mt-5 pt-4 border-t border-stone-100 text-center">
            <span className="text-[11px] text-stone-500">
              Acceso interno seguro para colaboradores autorizados
            </span>
          </div>
        </div>
      </div>

      {/* Forgot Password Modal */}
      {forgotModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-sm bg-white rounded-3xl p-6 shadow-2xl border border-stone-200 animate-in fade-in zoom-in-95 duration-150">
            <h3 className="text-base font-bold text-[#5A3825] mb-1.5">
              Recuperar contraseña
            </h3>
            <p className="text-xs text-stone-600 mb-4 leading-relaxed">
              Ingresa el correo corporativo registrado para recibir el enlace de restablecimiento.
            </p>
            <form onSubmit={handleForgotSubmit} className="space-y-3">
              <input
                type="email"
                value={forgotEmail}
                onChange={(e) => setForgotEmail(e.target.value)}
                placeholder="ejemplo@eloasis.com.co"
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-xs font-medium focus:ring-2 focus:ring-[#F47B20] focus:outline-hidden"
                required
              />
              <div className="grid grid-cols-2 gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setForgotModalOpen(false)}
                  className="py-2.5 px-4 rounded-xl border border-stone-200 text-stone-700 font-semibold text-xs hover:bg-stone-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="py-2.5 px-4 rounded-xl bg-[#F47B20] text-white font-bold text-xs hover:bg-[#E06810]"
                >
                  Enviar enlace
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
